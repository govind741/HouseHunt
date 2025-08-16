This is a new [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

# Getting Started

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

## Prerequisites

### System Requirements

- **Node.js**: >= 18.x
- **npm** or **Yarn**
- **Watchman**: For file watching (install via `brew install watchman`)
- **Java Development Kit (JDK)**: Version 17-20 (this project uses JDK 17)
- **Android Studio**: For Android development
- **Xcode**: For iOS development (macOS only)

### Java Setup (Important!)

This project requires **JDK 17** specifically. If you have multiple Java versions installed, this project uses `direnv` to automatically set the correct Java version when you enter the project directory.

#### First-time Setup:

1. **Install JDK 17** (if not already installed):

   ```sh
   brew install openjdk@17
   ```

2. **Install direnv** (for automatic environment switching):

   ```sh
   brew install direnv
   ```

3. **Configure your shell** (add to `~/.zshrc` or `~/.bashrc`):

   ```sh
   eval "$(direnv hook zsh)"  # For zsh
   # OR
   eval "$(direnv hook bash)" # For bash
   ```

4. **Reload your shell**:

   ```sh
   source ~/.zshrc  # or ~/.bashrc
   ```

5. **Allow the project's environment file**:
   ```sh
   cd /path/to/homehunt-dev
   direnv allow
   ```

The project will now automatically use Java 17 whenever you're in this directory.

## Step 1: Install Dependencies

First, install the project dependencies:

```sh
# Using npm
npm install

# OR using Yarn
yarn install
```

## Step 2: Start Metro

Start the **Metro** JavaScript bundler:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

Keep this terminal window open - Metro needs to run continuously during development.

## Step 3: Build and Run Your App

Open a new terminal window/pane and navigate to your project directory. The Java environment will be automatically configured thanks to direnv.

### Android

#### Prerequisites for Android:

- Android Studio installed
- Android SDK configured
- Android device connected or emulator running
- USB debugging enabled (for physical devices)

#### Run the app:

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

#### Troubleshooting Android:

If you encounter permission issues with gradlew:

```sh
# Remove macOS quarantine (if needed)
cd android
xattr -d com.apple.quarantine gradlew
```

### iOS

#### Prerequisites for iOS:

- Xcode installed (macOS only)
- iOS Simulator or physical iOS device
- CocoaPods dependencies installed

#### First-time iOS setup:

```sh
# Install Ruby dependencies
bundle install

# Install CocoaPods dependencies
cd ios
bundle exec pod install
cd ..
```

#### Run the app:

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

## Step 4: Verify Installation

If everything is set up correctly, you should see your app running on:

- Android Emulator, iOS Simulator, or your connected device
- Metro bundler running on `http://localhost:8081`

## Development Workflow

### Making Changes

1. Edit your code in your preferred editor
2. Save the file
3. The app will automatically reload thanks to **Fast Refresh**

### Manual Reload

If you need to manually reload:

- **Android**: Press `R` twice or `Ctrl/Cmd + M` → "Reload"
- **iOS**: Press `R` in the iOS Simulator

### Debugging

- Open the developer menu: `Ctrl/Cmd + M` (Android) or `Cmd + D` (iOS)
- Enable remote debugging, inspect elements, or view logs

## Build Configuration

### Environment Variables

The project uses `.envrc` for environment configuration:

- `JAVA_HOME`: Automatically set to JDK 17
- `PATH`: Updated to use the correct Java version

### Gradle Configuration

- **Gradle Version**: 8.13
- **Kotlin Version**: 2.0.21
- **Target SDK**: Check `android/app/build.gradle`

## Troubleshooting

### Common Issues:

1. **Java Version Error**:

   ```
   Error: JDK version 24 not supported
   ```

   **Solution**: Ensure direnv is working and you've allowed the `.envrc` file.

2. **Metro Port Already in Use**:

   ```
   Error: listen EADDRINUSE: address already in use :::8081
   ```

   **Solution**: Metro is already running. This is normal - just proceed with building.

3. **Gradlew Permission Denied**:

   ```
   Error: spawn EPERM
   ```

   **Solution**: Run `xattr -d com.apple.quarantine android/gradlew`

4. **Android SDK Not Found**:
   **Solution**: Ensure Android Studio is installed and SDK path is configured.

### Diagnostic Commands:

```sh
# Check React Native environment
npx react-native doctor

# Check Java version (should show 17.x.x)
java -version

# Check available Java versions
/usr/libexec/java_home -V

# Verify direnv is working
direnv status
```

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.

## Quick Start Guide

### For First-Time Setup:

1. **Clone and navigate to the project**:

   ```sh
   cd /path/to/homehunt-dev
   ```

2. **Allow direnv** (if prompted):

   ```sh
   direnv allow
   ```

3. **Install dependencies**:

   ```sh
   npm install
   ```

4. **Start Metro bundler** (in one terminal):

   ```sh
   npm start
   ```

5. **Run the app** (in another terminal):

   ```sh
   # For Android
   npm run android

   # For iOS
   npm run ios
   ```

### Build Process Details

The build process includes:

- **Gradle Build**: Uses Gradle 8.13 with Kotlin 2.0.21
- **Native Dependencies**: Compiles various React Native libraries
- **CMake**: Builds native C++ components for different architectures (arm64-v8a, armeabi-v7a, x86, x86_64)
- **APK Generation**: Creates and installs the debug APK on your device

**Typical build time**: 5-8 minutes for first build, faster for subsequent builds.

### Project Structure

```
homehunt-dev/
├── .envrc                 # Java environment configuration
├── android/               # Android-specific code
├── ios/                   # iOS-specific code
├── src/                   # React Native source code
├── node_modules/          # Dependencies
└── package.json           # Project configuration
```

## Advanced Troubleshooting

### Build Failures

1. **Clean Build** (if build fails):

   ```sh
   cd android
   ./gradlew clean
   cd ..
   npm run android
   ```

2. **Reset Metro Cache**:

   ```sh
   npm start -- --reset-cache
   ```

3. **Clear Node Modules**:
   ```sh
   rm -rf node_modules
   npm install
   ```

### Performance Issues

- **Enable Hermes**: Already configured for better performance
- **Optimize Images**: Use appropriate image formats and sizes
- **Bundle Analysis**: Use `npx react-native bundle --analyze` to analyze bundle size

### Device-Specific Issues

1. **Android Device Not Detected**:

   ```sh
   adb devices
   adb kill-server
   adb start-server
   ```

2. **iOS Simulator Issues**:
   ```sh
   xcrun simctl list devices
   xcrun simctl boot "iPhone 15"
   ```

## Project-Specific Configuration

### Environment Setup

- **Java Version**: This project is configured to use JDK 17 automatically via direnv
- **Build Tool**: Uses Gradle 8.13 with Kotlin 2.0.21
- **Architecture Support**: Builds for arm64-v8a, armeabi-v7a, x86, and x86_64
- **Development Server**: Metro runs on port 8081
- **Hot Reload**: Fast Refresh is enabled for rapid development

### Dependencies Included

- React Native Async Storage
- React Native DateTime Picker
- React Native Fast Image
- React Native Geolocation Service
- React Native Image Picker
- React Native Permissions
- React Native Safe Area Context
- React Native Screens
- React Native Share
- React Native SVG
- React Native Video

### Build Output

After successful build, you'll see:

- APK installed on your device
- Metro bundler connecting to development server
- App launching automatically on your device

---

**Note**: This README has been updated with comprehensive setup instructions based on the actual build process and troubleshooting steps encountered during development.
