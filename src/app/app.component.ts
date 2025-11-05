import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import playerjs from '@gumlet/player.js';
type PlayerInstance = InstanceType<(typeof playerjs)['Player']>;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  @ViewChild('playerFrame') playerFrame?: ElementRef<HTMLIFrameElement>;

  readonly videos: string[] = [
    'https://play.gumlet.io/embed/68f83b7a24f455e32d0c743d',
    'https://play.gumlet.io/embed/68f079526b5c1015acd47f0e',
    'https://play.gumlet.io/embed/68f08a5ebefe20b134bad81e',
    'https://play.gumlet.io/embed/68f08ffe558b404636cc149b',
    'https://play.gumlet.io/embed/68f83b7a24f455e32d0c743d'
  ];
  readonly params: Record<string, string | number | boolean> = {
    background: false,
    autoplay: true,
    loop: false,
    disableControls: false,
    muted: false,
    playsinline: true
  };

  currentVideoIndex = 0;
  safeSrc?: SafeResourceUrl;
  private playerInstance?: PlayerInstance;
  currentVideoUrl: string = '';
  currentVolumne: number = 50;
  videoRendered: boolean = false;

  constructor(private readonly sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.updateSafeSrc();
  }

  showPrevious(): void {
    if (this.currentVideoIndex === 0) {
      return;
    }
    this.currentVideoIndex--;
    this.updateSafeSrc();
  }

  showNext(): void {
    if (this.currentVideoIndex >= this.videos.length - 1) {
      return;
    }

    this.currentVideoIndex++;
    this.updateSafeSrc();
  }

  selectVideo(index: number): void {
    if (index < 0 || index >= this.videos.length || index === this.currentVideoIndex) {
      return;
    }
    this.currentVideoIndex = index;
    this.updateSafeSrc();
  }

  hasPrevious(): boolean {
    return this.currentVideoIndex > 0;
  }

  hasNext(): boolean {
    return this.currentVideoIndex < this.videos.length - 1;
  }

 onFrameLoad(){
    const iframeElement = this.playerFrame?.nativeElement;

    if (!iframeElement) {
      return;
    }

    try {
      this.playerInstance = new playerjs.Player(iframeElement);

      // Ready
      this.playerInstance.on('ready', async () => {
          console.log('Gumlet >> player is ready ', this);
          try { await (this.playerInstance as any)?.play?.(); } catch {}
          try { await (this.playerInstance as any)?.unmute?.(); } catch {}
          try { await (this.playerInstance as any)?.setVolume?.(100); } catch {}
          this.videoRendered = false;
      });

    } catch (error) {
      console.warn('Failed to initialise Gumlet Player', error);
    }
  }

  private updateSafeSrc(): void {
     this.videoRendered = false;
    const url = this.appendParams(this.videos[this.currentVideoIndex]);
    this.currentVideoUrl = url;
    this.safeSrc = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  private appendParams(videoUrl: string): string {
    if (!this.params || Object.keys(this.params).length === 0) {
      return videoUrl;
    }

    try {
      const url = new URL(videoUrl);

      Object.entries(this.params).forEach(([key, value]) => {
        url.searchParams.set(key, String(value));
      });

      return url.toString();
    } catch {
      return videoUrl;
    }
  }
}
