const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = 'https://vykmbqmpoubmjkfbigcs.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5a21icW1wb3VibWprZmJpZ2NzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0MDk4MDMsImV4cCI6MjA4Mzk4NTgwM30.VbuN57XcAXiDEg1PM4ETNY_qCnmPMQPzPWuQJATR3-g';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const quotes = [
    // Motivation
    { content: "The only way to do great work is to love what you do.", author: "Steve Jobs", category: "Motivation" },
    { content: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill", category: "Motivation" },
    { content: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson", category: "Motivation" },
    { content: "Keep your face always toward the sunshine—and shadows will fall behind you.", author: "Walt Whitman", category: "Motivation" },
    { content: "You define your own life. Don't let other people write your script.", author: "Oprah Winfrey", category: "Motivation" },
    // ... (I will fill more in the script)
    { content: "The secret of getting ahead is getting started.", author: "Mark Twain", category: "Motivation" },
    { content: "It always seems impossible until it's done.", author: "Nelson Mandela", category: "Motivation" },
    { content: "Believe you can and you're halfway there.", author: "Theodore Roosevelt", category: "Motivation" },
    { content: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt", category: "Motivation" },
    { content: "The only limit to our realization of tomorrow will be our doubts of today.", author: "Franklin D. Roosevelt", category: "Motivation" },
    { content: "Act as if what you do makes a difference. It does.", author: "William James", category: "Motivation" },
    { content: "Success is stumbling from failure to failure with no loss of enthusiasm.", author: "Winston Churchill", category: "Motivation" },
    { content: "You are never too old to set another goal or to dream a new dream.", author: "C.S. Lewis", category: "Motivation" },
    { content: "Try to be a rainbow in someone else's cloud.", author: "Maya Angelou", category: "Motivation" },
    { content: "You do not find the happy life. You make it.", author: "Camilla Eyring Kimball", category: "Motivation" },
    { content: "Inspiration comes from within yourself. One has to be positive. When you're positive, good things happen.", author: "Deep Roy", category: "Motivation" },
    { content: "The best way to predict the future is to create it.", author: "Peter Drucker", category: "Motivation" },
    { content: "Your dynamic and your action will determine your results.", author: "T.H. Meyer", category: "Motivation" },
    { content: "Don't be pushed around by the fears in your mind. Be led by the dreams in your heart.", author: "Roy T. Bennett", category: "Motivation" },
    { content: "If you want to live a happy life, tie it to a goal, not to people or things.", author: "Albert Einstein", category: "Motivation" },

    // Love
    { content: "To love and be loved is to feel the sun from both sides.", author: "David Viscott", category: "Love" },
    { content: "Love all, trust a few, do wrong to none.", author: "William Shakespeare", category: "Love" },
    { content: "You know you're in love when you can't fall asleep because reality is finally better than your dreams.", author: "Dr. Seuss", category: "Love" },
    { content: "Blessed is the influence of one true, loving human soul on another.", author: "George Eliot", category: "Love" },
    { content: "Love recognizes no barriers. It jumps hurdles, leaps fences, penetrates walls to arrive at its destination full of hope.", author: "Maya Angelou", category: "Love" },
    { content: "The best thing to hold onto in life is each other.", author: "Audrey Hepburn", category: "Love" },
    { content: "Love makes your soul crawl out from its hiding place.", author: "Zora Neale Hurston", category: "Love" },
    { content: "Spread love everywhere you go. Let no one ever come to you without leaving happier.", author: "Mother Teresa", category: "Love" },
    { content: "Where there is love there is life.", author: "Mahatma Gandhi", category: "Love" },
    { content: "Life without love is like a tree without blossoms or fruit.", author: "Khalil Gibran", category: "Love" },
    { content: "The giving of love is an education in itself.", author: "Eleanor Roosevelt", category: "Love" },
    { content: "Love is composed of a single soul inhabiting two bodies.", author: "Aristotle", category: "Love" },
    { content: "Loved you yesterday, love you still, always have, always will.", author: "Elaine Davis", category: "Love" },
    { content: "Love is a friendship set to music.", author: "Joseph Campbell", category: "Love" },
    { content: "To love oneself is the beginning of a lifelong romance.", author: "Oscar Wilde", category: "Love" },
    { content: "The more one judges, the less one loves.", author: "Honoré de Balzac", category: "Love" },
    { content: "A successful marriage requires falling in love many times, always with the same person.", author: "Mignon McLaughlin", category: "Love" },
    { content: "Kindness in words creates confidence. Kindness in thinking creates profoundness. Kindness in giving creates love.", author: "Lao Tzu", category: "Love" },
    { content: "Love is something eternal; the aspect may change, but not the essence.", author: "Vincent van Gogh", category: "Love" },
    { content: "We love because it's the only true adventure.", author: "Nikki Giovanni", category: "Love" },

    // Success
    { content: "Success usually comes to those who are too busy to be looking for it.", author: "Henry David Thoreau", category: "Success" },
    { content: "Don't be afraid to give up the good to go for the great.", author: "John D. Rockefeller", category: "Success" },
    { content: "Success is not the key to happiness. Happiness is the key to success.", author: "Albert Schweitzer", category: "Success" },
    { content: "The road to success and the road to failure are almost exactly the same.", author: "Colin R. Davis", category: "Success" },
    { content: "Opportunities don't happen. You create them.", author: "Chris Grosser", category: "Success" },
    { content: "I find that the harder I work, the more luck I seem to have.", author: "Thomas Jefferson", category: "Success" },
    { content: "Successful people do what unsuccessful people are not willing to do.", author: "Jim Rohn", category: "Success" },
    { content: "There are no secrets to success. It is the result of preparation, hard work, and learning from failure.", author: "Colin Powell", category: "Success" },
    { content: "The secret of success is to do the common thing uncommonly well.", author: "John D. Rockefeller Jr.", category: "Success" },
    { content: "Success is how high you bounce when you hit bottom.", author: "George S. Patton", category: "Success" },
    { content: "Success is getting what you want. Happiness is wanting what you get.", author: "Dale Carnegie", category: "Success" },
    { content: "If you really look closely, most overnight successes took a long time.", author: "Steve Jobs", category: "Success" },
    { content: "Success consists of going from failure to failure without loss of enthusiasm.", author: "Winston Churchill", category: "Success" },
    { content: "I attribute my success to this: I never gave or took any excuse.", author: "Florence Nightingale", category: "Success" },
    { content: "Success is not just about what you accomplish in your life; it's about what you inspire others to do.", author: "Unknown", category: "Success" },
    { content: "Success is walking from failure to failure with no loss of enthusiasm.", author: "Winston Churchill", category: "Success" },
    { content: "A person who never made a mistake never tried anything new.", author: "Albert Einstein", category: "Success" },
    { content: "The start is what stops most people.", author: "Don Shula", category: "Success" },
    { content: "Success is the sum of small efforts, repeated day-in and day-out.", author: "Robert Collier", category: "Success" },
    { content: "Formula for success: rise early, work hard, strike oil.", author: "J. Paul Getty", category: "Success" },

    // Wisdom
    { content: "The only true wisdom is in knowing you know nothing.", author: "Socrates", category: "Wisdom" },
    { content: "The simple things are also the most extraordinary things, and only the wise can see them.", author: "Paulo Coelho", category: "Wisdom" },
    { content: "The saddest aspect of life right now is that science gathers knowledge faster than society gathers wisdom.", author: "Isaac Asimov", category: "Wisdom" },
    { content: "Knowledge comes, but wisdom lingers.", author: "Alfred Lord Tennyson", category: "Wisdom" },
    { content: "Wisdom begins in wonder.", author: "Socrates", category: "Wisdom" },
    { content: "Turn your wounds into wisdom.", author: "Oprah Winfrey", category: "Wisdom" },
    { content: "Silence is the sleep that nourishes wisdom.", author: "Francis Bacon", category: "Wisdom" },
    { content: "The doorstep to the temple of wisdom is a knowledge of our own ignorance.", author: "Benjamin Franklin", category: "Wisdom" },
    { content: "Count your age by friends, not years. Count your life by smiles, not tears.", author: "John Lennon", category: "Wisdom" },
    { content: "Wisdom is not a product of schooling but of the lifelong attempt to acquire it.", author: "Albert Einstein", category: "Wisdom" },
    { content: "A wise man will make more opportunities than he finds.", author: "Francis Bacon", category: "Wisdom" },
    { content: "Discipline is the bridge between goals and accomplishment.", author: "Jim Rohn", category: "Wisdom" },
    { content: "Wonder is the beginning of wisdom.", author: "Socrates", category: "Wisdom" },
    { content: "Never mistake knowledge for wisdom. One helps you make a living; the other helps you make a life.", author: "Sandra Carey", category: "Wisdom" },
    { content: "By three methods we may learn wisdom: First, by reflection, which is noblest; Second, by imitation, which is easiest; and third by experience, which is the bitterest.", author: "Confucius", category: "Wisdom" },
    { content: "Wisdom is the reward you get for a lifetime of listening when you'd have rather talked.", author: "Mark Twain", category: "Wisdom" },
    { content: "Honesty is the first chapter in the book of wisdom.", author: "Thomas Jefferson", category: "Wisdom" },
    { content: "The wise man does not give the right answers, he poses the right questions.", author: "Claude Lévi-Strauss", category: "Wisdom" },
    { content: "Life can only be understood backwards; but it must be lived forwards.", author: "Søren Kierkegaard", category: "Wisdom" },
    { content: "A heart is a total trust.", author: "Unknown", category: "Wisdom" },

    // Humor
    { content: "I'm not lazy, I'm on energy saving mode.", author: "Unknown", category: "Humor" },
    { content: "I told my wife she was drawing her eyebrows too high. She looked surprised.", author: "Unknown", category: "Humor" },
    { content: "My wife told me to stop impersonating a flamingo. I had to put my foot down.", author: "Unknown", category: "Humor" },
    { content: "I'm reading a book on anti-gravity. It's impossible to put down!", author: "Unknown", category: "Humor" },
    { content: "I used to play piano by ear, but now I use my hands.", author: "Unknown", category: "Humor" },
    { content: "Common sense is like deodorant. The people who need it most never use it.", author: "Unknown", category: "Humor" },
    { content: "Life is short. Smile while you still have teeth.", author: "Unknown", category: "Humor" },
    { content: "I'm on a seafood diet. I see food and I eat it.", author: "Unknown", category: "Humor" },
    { content: "I told my doctor that I broke my arm in two places. He told me to stop going to those places.", author: "Henny Youngman", category: "Humor" },
    { content: "People say nothing is impossible, but I do nothing every day.", author: "Winnie the Pooh", category: "Humor" },
    { content: "The road to success is always under construction.", author: "Lily Tomlin", category: "Humor" },
    { content: "If you think you are too small to make a difference, try sleeping with a mosquito.", author: "Dalai Lama", category: "Humor" },
    { content: "A day without sunshine is like, you know, night.", author: "Steve Martin", category: "Humor" },
    { content: "Everything is funny, as long as it's happening to somebody else.", author: "Will Rogers", category: "Humor" },
    { content: "A balanced diet means a cupcake in each hand.", author: "Unknown", category: "Humor" },
    { content: "My bank account is a constant reminder that I'm not as funny as I think I am.", author: "Unknown", category: "Humor" },
    { content: "I'm not clumsy. The floor just hates me, the table and chairs are bullies, and the walls get in my way.", author: "Unknown", category: "Humor" },
    { content: "I'm great at multi-tasking. I can waste time, be unproductive, and procrastinate all at once.", author: "Unknown", category: "Humor" },
    { content: "I don't need a hair stylist, my pillow gives me a new hairstyle every morning.", author: "Unknown", category: "Humor" },
    { content: "If at first you don't succeed, then skydiving isn't for you.", author: "Steven Wright", category: "Humor" },
    // Adding more to reach 100+
    { content: "Do not take life too seriously. You will never get out of it alive.", author: "Elbert Hubbard", category: "Humor" },
    { content: "If you're going to tell people the truth, be funny or they'll kill you.", author: "Billy Wilder", category: "Humor" },
    { content: "The best way to appreciate your job is to imagine yourself without one.", author: "Oscar Wilde", category: "Humor" },
    { content: "Life is a shipwreck, but we must not forget to sing in the lifeboats.", author: "Voltaire", category: "Humor" },
    { content: "If you're too open-minded, your brains will fall out.", author: "Lawrence Ferlinghetti", category: "Humor" },
    { content: "Age is something that doesn't matter, unless you are a cheese.", author: "Luis Buñuel", category: "Humor" },
    { content: "Better to remain silent and be thought a fool than to speak and remove all doubt.", author: "Abraham Lincoln", category: "Humor" },
    { content: "Happiness is having a large, loving, caring, close-knit family in another city.", author: "George Burns", category: "Humor" },
    { content: "I drank some food coloring. I feel like I'm dyeing inside.", author: "Unknown", category: "Humor" },
    { content: "Laziness is nothing more than the habit of resting before you get tired.", author: "Jules Renard", category: "Humor" },
];

async function seed() {
    const { data: categories, error: catError } = await supabase.from('categories').select('*');
    if (catError) {
        console.error('Error fetching categories:', catError);
        return;
    }

    const catMap = {};
    categories.forEach(cat => catMap[cat.name] = cat.id);

    const formattedQuotes = quotes.map(q => ({
        content: q.content,
        author: q.author,
        category_id: catMap[q.category]
    }));

    const { error: quoteError } = await supabase.from('quotes').insert(formattedQuotes);
    if (quoteError) {
        console.error('Error inserting quotes:', quoteError);
    } else {
        console.log('Successfully seeded 100+ quotes!');
    }
}

seed();
