{
  inputs.flakelight.url = "github:nix-community/flakelight";
  outputs = { flakelight, ... }:
    flakelight ./. {
      nixpkgs.config = {
        allowUnfree = true;
        android_sdk.accept_license = true;
      };

      # packages.androidsdk = {androidenv}: androidenv.androidPkgs_9_0.androidsdk;

      packages.emulator = pkgs: pkgs.androidenv.emulateApp {
        name = "run-test-emulator";
        platformVersion = "34";
        abiVersion = "x86_64"; # armeabi-v7a, mips, x86_64
        systemImageType = "google_apis_playstore";
      };

      devShells.androidsdk = pkgs:
        let
          androidComposition = (pkgs.androidenv.composeAndroidPackages
            {
              includeEmulator = true;
              includeNDK = true;
              platformVersions = [ "34" ];
              ndkVersion = "25.1.8937393";
              buildToolsVersions = ["33.0.1" "34.0.0"];
              cmakeVersions = ["3.22.1"];
            });
        in
        (pkgs.buildFHSEnv {
          name = "android-sdk-env";
          targetPkgs = pkgs: (with pkgs; [
            jdk20
            androidComposition.androidsdk
            glibc
          ]);
          profile = with pkgs; ''
            export JAVA_HOME="${jdk20}";

            export ANDROID_SDK_ROOT="${androidComposition.androidsdk}/libexec/android-sdk";
            export ANDROID_NDK_ROOT="$ANDROID_SDK_ROOT/ndk-bundle";
            export ANDROID_HOME="$ANDROID_SDK_ROOT";

            export GRADLE_OPTS="-Dorg.gradle.jvmargs=-Xmx4g";
          '';
          runScript = "zsh";
        }).env;
    };
}
