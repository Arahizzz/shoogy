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
              ndkVersions = ["26.1.10909125" "25.1.8937393"];
              buildToolsVersions = ["33.0.1" "34.0.0"];
              cmakeVersions = ["3.22.1"];
            });
          llvmPackage = pkgs.llvmPackages_16;
          stdenv = llvmPackage.libcxxStdenv;
          libcxx = llvmPackage.libraries.libcxx;
          libcxxabi = llvmPackage.libraries.libcxxabi;
        in
        (pkgs.buildFHSEnv {
          name = "android-sdk-env";
          targetPkgs = pkgs: (with pkgs; [
            androidComposition.androidsdk

            jdk20
            python3
            nodejs
            stdenv
            libcxx
            libcxxabi

            git
            gitRepo
            gnupg
            curl
            procps
            openssl
            gnumake
            nettools
            schedtool
            util-linux
            m4
            gperf
            perl
            libxml2
            zip
            unzip
            bison
            flex
            lzop
          ]);
          multiPkgs = pkgs: with pkgs;
              [ zlib
                ncurses5
              ];
          profile = with pkgs; ''
            export JAVA_HOME="${jdk20}";

            export ANDROID_SDK_ROOT="${androidComposition.androidsdk}/libexec/android-sdk";
            export ANDROID_NDK_ROOT="$ANDROID_SDK_ROOT/ndk-bundle";
            export ANDROID_HOME="$ANDROID_SDK_ROOT";

            export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:/usr/lib:/usr/lib32:${libcxx}/lib:${libcxxabi}/lib;

            export GRADLE_OPTS="-Dorg.gradle.jvmargs=-Xmx4g";
          '';
          runScript = "bash";
        }).env;
    };
}
