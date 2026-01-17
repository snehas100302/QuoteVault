-- Create tables
CREATE TABLE public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.quotes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content TEXT NOT NULL,
    author TEXT NOT NULL,
    category_id UUID REFERENCES public.categories(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.favorites (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    quote_id UUID REFERENCES public.quotes(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (user_id, quote_id)
);

CREATE TABLE public.collections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.collection_quotes (
    collection_id UUID REFERENCES public.collections(id) ON DELETE CASCADE,
    quote_id UUID REFERENCES public.quotes(id) ON DELETE CASCADE,
    PRIMARY KEY (collection_id, quote_id)
);

CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    full_name TEXT,
    avatar_url TEXT,
    settings JSONB DEFAULT '{"theme": "system", "fontSize": 16, "accentColor": "#6366f1"}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS (Row Level Security) - Simplified for assignment
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public categories are viewable by everyone" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public quotes are viewable by everyone" ON public.quotes FOR SELECT USING (true);
CREATE POLICY "Users can view their own favorites" ON public.favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own favorites" ON public.favorites FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own collections" ON public.collections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own collections" ON public.collections FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own profiles" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profiles" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Collection Quotes
CREATE POLICY "Users can view quotes in their collections" ON public.collection_quotes FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.collections WHERE id = collection_id AND user_id = auth.uid())
);
CREATE POLICY "Users can manage quotes in their collections" ON public.collection_quotes FOR ALL USING (
  EXISTS (SELECT 1 FROM public.collections WHERE id = collection_id AND user_id = auth.uid())
);

-- Trigger to create profile on sign up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- Seed Categories
INSERT INTO public.categories (name) VALUES 
('Motivation'), ('Love'), ('Success'), ('Wisdom'), ('Humor')
ON CONFLICT (name) DO NOTHING;

-- Seed Quotes
DO $$ 
DECLARE 
    mot_id UUID := (SELECT id FROM public.categories WHERE name = 'Motivation');
    love_id UUID := (SELECT id FROM public.categories WHERE name = 'Love');
    succ_id UUID := (SELECT id FROM public.categories WHERE name = 'Success');
    wis_id UUID := (SELECT id FROM public.categories WHERE name = 'Wisdom');
    hum_id UUID := (SELECT id FROM public.categories WHERE name = 'Humor');
BEGIN
    INSERT INTO public.quotes (content, author, category_id) VALUES
    ('The only way to do great work is to love what you do.', 'Steve Jobs', mot_id),
    ('Success is not final, failure is not fatal: it is the courage to continue that counts.', 'Winston Churchill', mot_id),
    ('Don''t watch the clock; do what it does. Keep going.', 'Sam Levenson', mot_id),
    ('Keep your face always toward the sunshine—and shadows will fall behind you.', 'Walt Whitman', mot_id),
    ('You define your own life. Don''t let other people write your script.', 'Oprah Winfrey', mot_id),
    ('The secret of getting ahead is getting started.', 'Mark Twain', mot_id),
    ('It always seems impossible until it''s done.', 'Nelson Mandela', mot_id),
    ('Believe you can and you''re halfway there.', 'Theodore Roosevelt', mot_id),
    ('The future belongs to those who believe in the beauty of their dreams.', 'Eleanor Roosevelt', mot_id),
    ('The only limit to our realization of tomorrow will be our doubts of today.', 'Franklin D. Roosevelt', mot_id),
    ('Act as if what you do makes a difference. It does.', 'William James', mot_id),
    ('Success is stumbling from failure to failure with no loss of enthusiasm.', 'Winston Churchill', mot_id),
    ('You are never too old to set another goal or to dream a new dream.', 'C.S. Lewis', mot_id),
    ('Try to be a rainbow in someone else''s cloud.', 'Maya Angelou', mot_id),
    ('You do not find the happy life. You make it.', 'Camilla Eyring Kimball', mot_id),
    ('Inspiration comes from within yourself. One has to be positive. When you''re positive, good things happen.', 'Deep Roy', mot_id),
    ('The best way to predict the future is to create it.', 'Peter Drucker', mot_id),
    ('Your dynamic and your action will determine your results.', 'T.H. Meyer', mot_id),
    ('Don''t be pushed around by the fears in your mind. Be led by the dreams in your heart.', 'Roy T. Bennett', mot_id),
    ('If you want to live a happy life, tie it to a goal, not to people or things.', 'Albert Einstein', mot_id),
    
    ('To love and be loved is to feel the sun from both sides.', 'David Viscott', love_id),
    ('Love all, trust a few, do wrong to none.', 'William Shakespeare', love_id),
    ('You know you''re in love when you can''t fall asleep because reality is finally better than your dreams.', 'Dr. Seuss', love_id),
    ('Blessed is the influence of one true, loving human soul on another.', 'George Eliot', love_id),
    ('Love recognizes no barriers. It jumps hurdles, leaps fences, penetrates walls to arrive at its destination full of hope.', 'Maya Angelou', love_id),
    ('The best thing to hold onto in life is each other.', 'Audrey Hepburn', love_id),
    ('Love makes your soul crawl out from its hiding place.', 'Zora Neale Hurston', love_id),
    ('Spread love everywhere you go. Let no one ever come to you without leaving happier.', 'Mother Teresa', love_id),
    ('Where there is love there is life.', 'Mahatma Gandhi', love_id),
    ('Life without love is like a tree without blossoms or fruit.', 'Khalil Gibran', love_id),
    ('The giving of love is an education in itself.', 'Eleanor Roosevelt', love_id),
    ('Love is composed of a single soul inhabiting two bodies.', 'Aristotle', love_id),
    ('Loved you yesterday, love you still, always have, always will.', 'Elaine Davis', love_id),
    ('Love is a friendship set to music.', 'Joseph Campbell', love_id),
    ('To love oneself is the beginning of a lifelong romance.', 'Oscar Wilde', love_id),
    ('The more one judges, the less one loves.', 'Honoré de Balzac', love_id),
    ('A successful marriage requires falling in love many times, always with the same person.', 'Mignon McLaughlin', love_id),
    ('Kindness in words creates confidence. Kindness in thinking creates profoundness. Kindness in giving creates love.', 'Lao Tzu', love_id),
    ('Love is something eternal; the aspect may change, but not the essence.', 'Vincent van Gogh', love_id),
    ('We love because it''s the only true adventure.', 'Nikki Giovanni', love_id),

    ('Success usually comes to those who are too busy to be looking for it.', 'Henry David Thoreau', succ_id),
    ('Don''t be afraid to give up the good to go for the great.', 'John D. Rockefeller', succ_id),
    ('Success is not the key to happiness. Happiness is the key to success.', 'Albert Schweitzer', succ_id),
    ('The road to success and the road to failure are almost exactly the same.', 'Colin R. Davis', succ_id),
    ('Opportunities don''t happen. You create them.', 'Chris Grosser', succ_id),
    ('I find that the harder I work, the more luck I seem to have.', 'Thomas Jefferson', succ_id),
    ('Successful people do what unsuccessful people are not willing to do.', 'Jim Rohn', succ_id),
    ('There are no secrets to success. It is the result of preparation, hard work, and learning from failure.', 'Colin Powell', succ_id),
    ('The secret of success is to do the common thing uncommonly well.', 'John D. Rockefeller Jr.', succ_id),
    ('Success is how high you bounce when you hit bottom.', 'George S. Patton', succ_id),
    ('Success is getting what you want. Happiness is wanting what you get.', 'Dale Carnegie', succ_id),
    ('If you really look closely, most overnight successes took a long time.', 'Steve Jobs', succ_id),
    ('Success consists of going from failure to failure without loss of enthusiasm.', 'Winston Churchill', succ_id),
    ('I attribute my success to this: I never gave or took any excuse.', 'Florence Nightingale', succ_id),
    ('Success is not just about what you accomplish in your life; it''s about what you inspire others to do.', 'Unknown', succ_id),
    ('A person who never made a mistake never tried anything new.', 'Albert Einstein', succ_id),
    ('The start is what stops most people.', 'Don Shula', succ_id),
    ('Success is the sum of small efforts, repeated day-in and day-out.', 'Robert Collier', succ_id),
    ('Formula for success: rise early, work hard, strike oil.', 'J. Paul Getty', succ_id),
    ('Success is simple. Do what''s right, the right way, at the right time.', 'Arnold H. Glasow', succ_id),

    ('The only true wisdom is in knowing you know nothing.', 'Socrates', wis_id),
    ('The simple things are also the most extraordinary things, and only the wise can see them.', 'Paulo Coelho', wis_id),
    ('The saddest aspect of life right now is that science gathers knowledge faster than society gathers wisdom.', 'Isaac Asimov', wis_id),
    ('Knowledge comes, but wisdom lingers.', 'Alfred Lord Tennyson', wis_id),
    ('Wisdom begins in wonder.', 'Socrates', wis_id),
    ('Turn your wounds into wisdom.', 'Oprah Winfrey', wis_id),
    ('Silence is the sleep that nourishes wisdom.', 'Francis Bacon', wis_id),
    ('The doorstep to the temple of wisdom is a knowledge of our own ignorance.', 'Benjamin Franklin', wis_id),
    ('Count your age by friends, not years. Count your life by smiles, not tears.', 'John Lennon', wis_id),
    ('Wisdom is not a product of schooling but of the lifelong attempt to acquire it.', 'Albert Einstein', wis_id),
    ('A wise man will make more opportunities than he finds.', 'Francis Bacon', wis_id),
    ('Discipline is the bridge between goals and accomplishment.', 'Jim Rohn', wis_id),
    ('Wonder is the beginning of wisdom.', 'Socrates', wis_id),
    ('Never mistake knowledge for wisdom. One helps you make a living; the other helps you make a life.', 'Sandra Carey', wis_id),
    ('By three methods we may learn wisdom: First, by reflection, which is noblest; Second, by imitation, which is easiest; and third by experience, which is the bitterest.', 'Confucius', wis_id),
    ('Wisdom is the reward you get for a lifetime of listening when you''d have rather talked.', 'Mark Twain', wis_id),
    ('Honesty is the first chapter in the book of wisdom.', 'Thomas Jefferson', wis_id),
    ('The wise man does not give the right answers, he poses the right questions.', 'Claude Lévi-Strauss', wis_id),
    ('Life can only be understood backwards; but it must be lived forwards.', 'Søren Kierkegaard', wis_id),
    ('A heart is a total trust.', 'Unknown', wis_id),

    ('I''m not lazy, I''m on energy saving mode.', 'Unknown', hum_id),
    ('I told my wife she was drawing her eyebrows too high. She looked surprised.', 'Unknown', hum_id),
    ('My wife told me to stop impersonating a flamingo. I had to put my foot down.', 'Unknown', hum_id),
    ('I''m reading a book on anti-gravity. It''s impossible to put down!', 'Unknown', hum_id),
    ('I used to play piano by ear, but now I use my hands.', 'Unknown', hum_id),
    ('Common sense is like deodorant. The people who need it most never use it.', 'Unknown', hum_id),
    ('Life is short. Smile while you still have teeth.', 'Unknown', hum_id),
    ('I''m on a seafood diet. I see food and I eat it.', 'Unknown', hum_id),
    ('I told my doctor that I broke my arm in two places. He told me to stop going to those places.', 'Henny Youngman', hum_id),
    ('People say nothing is impossible, but I do nothing every day.', 'Winnie the Pooh', hum_id),
    ('The road to success is always under construction.', 'Lily Tomlin', hum_id),
    ('If you think you are too small to make a difference, try sleeping with a mosquito.', 'Dalai Lama', hum_id),
    ('A day without sunshine is like, you know, night.', 'Steve Martin', hum_id),
    ('Everything is funny, as long as it''s happening to somebody else.', 'Will Rogers', hum_id),
    ('A balanced diet means a cupcake in each hand.', 'Unknown', hum_id),
    ('My bank account is a constant reminder that I''m not as funny as I think I am.', 'Unknown', hum_id),
    ('I''m not clumsy. The floor just hates me, the table and chairs are bullies, and the walls get in my way.', 'Unknown', hum_id),
    ('I''m great at multi-tasking. I can waste time, be unproductive, and procrastinate all at once.', 'Unknown', hum_id),
    ('I don''t need a hair stylist, my pillow gives me a new hairstyle every morning.', 'Unknown', hum_id),
    ('If at first you don''t succeed, then skydiving isn''t for you.', 'Steven Wright', hum_id),
    ('Do not take life too seriously. You will never get out of it alive.', 'Elbert Hubbard', hum_id),
    ('If you''re going to tell people the truth, be funny or they''ll kill you.', 'Billy Wilder', hum_id),
    ('The best way to appreciate your job is to imagine yourself without one.', 'Oscar Wilde', hum_id),
    ('Life is a shipwreck, but we must not forget to sing in the lifeboats.', 'Voltaire', hum_id),
    ('If you''re too open-minded, your brains will fall out.', 'Lawrence Ferlinghetti', hum_id),
    ('Age is something that doesn''t matter, unless you are a cheese.', 'Luis Buñuel', hum_id),
    ('Better to remain silent and be thought a fool than to speak and remove all doubt.', 'Abraham Lincoln', hum_id),
    ('Happiness is having a large, loving, caring, close-knit family in another city.', 'George Burns', hum_id),
    ('I drank some food coloring. I feel like I''m dyeing inside.', 'Unknown', hum_id),
    ('Laziness is nothing more than the habit of resting before you get tired.', 'Jules Renard', hum_id);
END $$;
