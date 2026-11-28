import { Component, Input } from '@angular/core';
import type { CropStage } from '../../core/crops/crop-lifecycle';

interface Leaf {
  x: number;
  y: number;
  rotation: number;
  width: number;
  height: number;
}

@Component({
  selector: 'app-crop-growth-illustration',
  template: `
    <svg viewBox="0 0 320 180" role="img" [attr.aria-label]="altText">
      <rect width="320" height="180" fill="#eaf4e5" />
      <circle cx="266" cy="38" r="20" fill="#f3c568" opacity=".8" />
      <path d="M0 112 Q76 76 151 111 T320 100 V140 H0Z" fill="#a5c78b" />
      <path d="M0 126 Q88 97 170 128 T320 117 V145 H0Z" fill="#78a96e" />
      <path d="M0 140 Q80 124 160 140 T320 133 V180 H0Z" fill="#79563a" />
      <path d="M0 143 Q80 128 160 143 T320 136" fill="none" stroke="#d1a26d" stroke-width="3" />
      <path [attr.d]="stemPath" fill="none" stroke="#327b49" stroke-linecap="round" stroke-width="6" />
      @for (leaf of leaves; track $index) {
        <ellipse [attr.cx]="leaf.x" [attr.cy]="leaf.y" [attr.rx]="leaf.width" [attr.ry]="leaf.height"
          [attr.transform]="'rotate(' + leaf.rotation + ' ' + leaf.x + ' ' + leaf.y + ')'"
          fill="#4c9a55" />
      }
      @if (stage === 'flowering') {
        <circle cx="160" [attr.cy]="plantTop - 8" r="7" fill="#f2d875" />
        <circle cx="153" [attr.cy]="plantTop - 8" r="4" fill="#fff3bd" />
        <circle cx="167" [attr.cy]="plantTop - 8" r="4" fill="#fff3bd" />
      }
      @if (isPotato && day / totalDays > .3) {
        <ellipse cx="145" cy="151" rx="13" ry="7" fill="#d2a06a" />
        <ellipse cx="173" cy="157" rx="11" ry="6" fill="#c48b58" />
        <ellipse cx="160" cy="166" rx="10" ry="5" fill="#d7a671" />
      }
      <path d="M160 140 V180 M80 138 Q105 158 130 180 M240 137 Q215 158 190 180" fill="none" stroke="#b98354" stroke-width="2" opacity=".75" />
      <rect x="14" y="13" width="56" height="24" rx="12" fill="#fff" opacity=".8" />
      <text x="42" y="29" text-anchor="middle" fill="#395a3c" font-size="11" font-family="sans-serif">{{ dayLabel }} {{ day }}</text>
    </svg>
  `,
  styleUrl: './crop-growth-illustration.component.css'
})
export class CropGrowthIllustrationComponent {
  @Input() cropName = '';
  @Input() day = 1;
  @Input() totalDays = 90;
  @Input() stage: CropStage = 'emergence';
  @Input() altText = '';
  @Input() dayLabel = 'Day';

  get progress(): number {
    return Math.max(0, Math.min(1, this.day / Math.max(1, this.totalDays)));
  }

  get plantTop(): number {
    return 125 - 88 * this.progress;
  }

  get stemPath(): string {
    return `M160 140 Q${157 + (this.day % 5)} ${this.plantTop + 40} 160 ${this.plantTop}`;
  }

  get leaves(): Leaf[] {
    const count = this.day < 1 ? 0 : Math.max(1, Math.ceil(this.progress * 8));
    return Array.from({ length: count }, (_, index) => {
      const side = index % 2 === 0 ? -1 : 1;
      const y = 132 - (this.plantTop < 132 ? (132 - this.plantTop) * (index + 1) / (count + 1) : 0);
      const x = 160 + side * (13 + index % 3 * 3);
      return {
        x,
        y,
        rotation: side * (27 + index % 4 * 5),
        width: 10 + this.progress * 3,
        height: 4 + this.progress * 2
      };
    });
  }

  get isPotato(): boolean {
    const crop = this.cropName.trim().toLocaleLowerCase();
    return crop.includes('potato') || crop.includes('બટાક') || crop.includes('आलू');
  }
}
