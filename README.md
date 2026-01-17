# QuoteVault

QuoteVault is a modern, premium mobile application for discovering, collecting, and sharing inspiring quotes. Built with React Native (Expo) and Supabase, it offers a seamless and engaging user experience with AI-powered features.

## ✨ Features

-   **Infinite Quote Discovery**: Scroll through an endless feed of curated quotes with smooth animations.
-   **Premium Design**: A polished UI with glassmorphism effects, custom typography, and haptic feedback.
-   **User Accounts**: Secure authentication (Sign Up, Login) via Supabase to sync favorites and collections across devices.
-   **Smart Search & Filtering**: Instantly find quotes by category (Motivation, Love, Wisdom, etc.) or search by keywords and authors.
-   **Interactive Scratch Card**: A gamified daily experience—scratch a card to reveal a unique quote for the day (with daily limits!).
-   **Collections**: Organize quotes into custom collections like "Morning Motivation" or "Work Vibes".
-   **Home Screen Widget**: A native Android widget that displays the Quote of the Day and updates automatically.
-   **Social Sharing**: Generate beautiful, shareable cards with different themes and export them to your device or social media.
-   **Offline Support**: Seamlessly browse cached quotes even when offline.

## 🛠 Tech Stack

-   **Frontend**: React Native, Expo, TypeScript
-   **Backend**: Supabase (PostgreSQL, Auth)
-   **Navigation**: Expo Router (File-based routing)
-   **Styling**: Custom Design System (StyleSheet)
-   **Animations**: React Native Reanimated
-   **Gestures**: React Native Gesture Handler & Haptics
-   **AI Tools**: Built with an Agentic AI workflow for planning, debugging, and code generation.

## 🚀 Getting Started

### Prerequisites

-   Node.js & npm/yarn
-   Expo Go app (on your mobile device) or Android Studio/Xcode (for emulators)

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/snehas100302/QuoteVault.git
    cd QuoteVault
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Environment Setup:**

    Create a `.env` file in the root directory and add your Supabase credentials:

    ```env
    EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
    EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Run the app:**

    ```bash
    npx expo start
    ```

    -   Scan the QR code with **Expo Go**.
    -   Press `a` to open on **Android Emulator**.
    -   Press `i` to open on **iOS Simulator**.

## 📱 Project Structure

-   `app/`: Application screens and routing (Expo Router).
-   `components/`: Reusable UI components (QuoteCard, ScratchCardModal, etc.).
-   `services/`: API services for Supabase, Quotes, and Notifications.
-   `context/`: React Context for global state (Auth, Theme).
-   `styles/`: Global theme configurations and constants.
-   `android/`: Native Android project files.

## 🤖 AI Workflow

This project leveraged AI tools for:
-   **Feature Planning**: Breaking down complex tasks like the Scratch Card logic.
-   **Code Generation**: Scaffolding UI components and Supabase integrations.
-   **Debugging**: Automatically identifying and fixing build errors (e.g., Gradle permission issues).
-   **Asset Generation**: Creating UI assets and icons.

## 📄 License

This project is licensed under the MIT License.
