
            ______ ______                                  
           / ____// ____/____ ___   ____   ___   ____ _
          / /_   / /_   / __ `__ \ / __ \ / _ \ / __ `/
         / __/  / __/  / / / / / // /_/ //  __// /_/ /
        /_/    /_/    /_/ /_/ /_// .___/ \___/ \__, /
                                /_/           /____/


                build: ffmpeg-4.1.3-armhf-static.tar.xz
              version: 4.1.3

                  gcc: 6.3.0
                 yasm: N/A
                 nasm: N/A

               libaom: N/A
               libass: 0.14.0
               libvpx: 1.8.0-329-g39ea3d72f
              libvmaf: N/A
              libx264: 0.157.2969 d4099dd
              libx265: N/A
              libxvid: 1.3.4-1+b2
              libwebp: 0.5.2 
              libzimg: 2.7.5
              libzvbi: N/A
             libdav1d: N/A
            libgnutls: 3.6.5
            libtheora: 1.2.0alpha1+git
            libfrei0r: 1.5.0-1
           libvidstab: 1.10
          libfreetype: 2.6.3-3.2
          libharfbuzz: 2.2.0
          libopenjpeg: N/A 

              libalsa: 1.1.7
              libsoxr: 0.1.3
              libopus: 1.3
             libspeex: 1.2
            libvorbis: 1.3.6
           libmp3lame: 3.100 
        librubberband: 1.8.1 
       libvo-amrwbenc: 0.1.3-1
    libopencore-amrnb: 0.1.3-2.1+b2
    libopencore-amrwb: 0.1.3-2.1+b2


      Notes: ffmpeg-10bit is no more, it's all included in ffmpeg now. 

             A limitation of statically linking glibc is the loss of DNS resolution. Installing
             nscd through your package manager will fix this.

             The vmaf filter needs external files to work- see model/000-README.TXT


      This static build is licensed under the GNU General Public License version 3.

      
      Patreon: https://www.patreon.com/johnvansickle
      Paypal:  https://www.paypal.me/johnvansickle 
      Bitcoin: 13pZjChR1gR6wqzGMuwLAzqeVR5o9XGoCP 

      email: john.vansickle@gmail.com
      irc:   relaxed @ irc://chat.freenode.net #ffmpeg
      url:   https://johnvansickle.com/ffmpeg/
