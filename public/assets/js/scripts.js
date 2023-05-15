'use strict';

import dom from './dom.js';
import { hsvToRgb, rgbToHsv, hslToRgb, rgbToHsl, decimalToHexString } from './color.js';


let input = dom.$('#color-selector');
let select = dom.$('#variations');
let parent = dom.$('.color-palettes');
let titles = ['Complementary', 'Triadic', 'Tetradic', 'Compound', 'Monochrome', 'Analogous'];
let modes = ['complement', 'triad', 'tetrad', 'compound', 'mono', 'analogous'];

class Palette {
    constructor(target, size, primaryColor, harmony, variations) {
        this.variations = variations;
        this.primaryColor = rgbToHsl(
            primaryColor[0],
            primaryColor[1],
            primaryColor[2]
        );

        switch (harmony) {
            case 'analogous': {
                this.colors = this.shades(this.analogous());

                break;
            }
            case 'complement': {
                this.colors = this.shades(this.complement());
                break;
            }
            case 'triad': {
                this.colors = this.shades(this.triad());
                break;
            }
            case 'tetrad': {
                this.colors = this.shades(this.tetrad());
                break;
            }
            case 'compound': {
                this.colors = this.shades(this.compound());
                break;
            }
            default: {
                this.colors = this.shades([this.primaryColor]);
            }
        }

        this.size = size;
        this.ctx;
        this.setup(target);
    }

    setup(target) {
        let canvas;

        if (target.nodeType) {
            canvas = target;
        } else {
            canvas = dom.$(target);
        }

        this.ctx = canvas.getContext('2d');

        canvas.height = this.size;
        canvas.width = this.size;
    }

    complement() {
        return [
            this.primaryColor,
            [
                ((this.primaryColor[0] * 360 + 180) % 360) / 360,
                this.primaryColor[1],
                1 - this.primaryColor[2]
            ]
        ];
    }

    triad() {
        let colors = [];
        for (let i = 0; i < 3; i++) {
            colors.push([
                ((this.primaryColor[0] * 360 + i * 120) % 360) / 360,
                this.primaryColor[1],
                this.primaryColor[2]
            ]);
        }
        return colors;
    }

    tetrad() {
        let colors = [];
        for (let i = 0; i < 4; i++) {
            colors.push([
                ((this.primaryColor[0] * 360 + i * 90) % 360) / 360,
                this.primaryColor[1],
                this.primaryColor[2]
            ]);
        }
        return colors;
    }

    analogous(color) {
        let colors = [];
        let temp = color || this.primaryColor;
        let variations = 3;
        for (let i = -30; i <= 30; i += 90 / variations) {
            colors.push([((temp[0] * 360 + i) % 360) / 360, temp[1], temp[2]]);
        }
        return colors;
    }

    compound() {
        let contrast = this.complement()[1];
        let analogOfContrast = this.analogous(contrast);
        return [analogOfContrast[0], this.primaryColor, analogOfContrast[2]];
    }

    shades(colors) {
        let shades = [];
        let shadesCount = Math.floor(this.variations / colors.length);
        shades.push(...colors);
        colors.forEach(color => {
            let temp = hslToRgb(color[0], color[1], color[2]);
            let hsv = rgbToHsv(temp[0], temp[1], temp[2]);

            let h = hsv[0],
                s = hsv[1],
                v = hsv[2];
            for (let i = 0; i < shadesCount; i++) {
                if (shades.length < this.variations) {
                    v += colors.length / this.variations;

                    v > 0.95 ? (v -= 1) : v;
                    v < 0 ? (v += 1) : v;
                    let temp2 = hsvToRgb(h, s, v);
                    let hsl = rgbToHsl(temp2[0], temp2[1], temp2[2]);

                    shades.push(hsl);
                }
            }
        });
        shades.sort((a, b) => {
            return a[2] - b[2];
        });
        shades.sort((a, b) => {
            return a[0] - b[0];
        });
        return shades;
    }

    show() {
        this.ctx.clearRect(0, 0, this.size, this.size);

        let start = -Math.PI / 2;
        let arcSize = (2 * Math.PI) / this.colors.length;

        for (let i = 0; i < this.colors.length; i++) {
            this.ctx.fillStyle = `hsl(${this.colors[i][0] * 360}, 
        ${this.colors[i][1] * 100}%, 
        ${this.colors[i][2] * 100}%)`;
            this.ctx.strokeStyle = '#fff';
            this.ctx.beginPath();
            this.ctx.lineTo(this.size / 2, this.size / 2);
            this.ctx.arc(
                this.size / 2,
                this.size / 2,
                this.size / 3,
                start,
                start + arcSize
            );
            this.ctx.lineTo(this.size / 2, this.size / 2);
            this.ctx.closePath();

            this.ctx.lineWidth = this.size / 20;
            this.ctx.stroke();
            this.ctx.fill();

            start += arcSize;
        }

        this.ctx.fillStyle = '#fff';
        this.ctx.beginPath();
        this.ctx.arc(this.size / 2, this.size / 2, this.size / 7, 0, 2 * Math.PI);
        this.ctx.closePath();
        this.ctx.fill();
    }
}
const createPalette = (title, parent, color, harmony, variations) => {
    let container = document.createElement('div');
    container.classList.add('hidden');
    container.setAttribute('id', `palette-container-${harmony}`);

    let heading = document.createElement('h2');
    heading.classList.add('palette-title');
    heading.innerHTML = title;

    container.appendChild(heading);

    let paletteCanvas = document.createElement('canvas');
    let canvasSize = 240;
    let palette = new Palette(paletteCanvas, canvasSize, color, harmony, variations);
    palette.show();

    let colorCodeContainer = document.createElement('div');
    colorCodeContainer.classList.add('code-container');


    palette.colors.forEach(color => {
        let colorContainer = document.createElement('div');
        colorContainer.classList.add('color');

        let colorDisplay = document.createElement('div');

        colorDisplay.style.background = `hsl(${color[0] * 360},${color[1] *
            100}%,${color[2] * 100}%)`;
        colorDisplay.classList.add('color-preview');

        let codes = document.createElement('div');
        codes.classList.add('color-codes');
        let rgb = hslToRgb(color[0], color[1], color[2]);
        let hex = `#${decimalToHexString(Math.round(rgb[0]))}${decimalToHexString(
            Math.round(rgb[1])
        )}${decimalToHexString(Math.round(rgb[2]))}`;

        let rgbValue = document.createElement('div');
        rgbValue.classList.add('rgb');
        rgb.forEach(value => {
            let item = document.createElement('div');

            item.textContent = Math.round(value);
            rgbValue.appendChild(item);
        });

        let hslValue = document.createElement('div');
        hslValue.classList.add('hsl');
        color.forEach((value, index) => {
            let item = document.createElement('div');
            if (index == 0) item.textContent = `${Math.round(value * 360)}°`;
            else item.textContent = `${Math.round(value * 100)}%`;
            hslValue.appendChild(item);
        });

        let hexValue = document.createElement('div');
        hexValue.classList.add('hex');
        hexValue.textContent = hex;

        codes.appendChild(rgbValue);
        codes.appendChild(hslValue);
        codes.appendChild(hexValue);
        colorContainer.appendChild(colorDisplay);
        colorContainer.appendChild(codes);

        colorCodeContainer.appendChild(colorContainer);
    });

    container.appendChild(paletteCanvas);
    container.appendChild(colorCodeContainer);
    parent.appendChild(container);
}

const genPalette = (titles, modes, primaryColor, variations) => {
    titles.forEach((title, index) => createPalette(title, parent, primaryColor, modes[index], variations));
}

const parseRgb = input => {
    let colorCode = input;
    colorCode = colorCode
        .split('')
        .splice(1)
        .join('');
    let rgb = [];
    for (let i = 0; i < colorCode.length; i += 2) rgb.push(parseInt(colorCode[i] + colorCode[i + 1], 16));
    return rgb;
}

genPalette(titles, modes, parseRgb(input.value), select.value);

select.addEventListener('change', () => {
    while (parent.firstChild) parent.removeChild(parent.firstChild);
    let rgb = parseRgb(input.value);
    genPalette(titles, modes, rgb, select.value);
});

input.addEventListener('change', () => {
    while (parent.firstChild) parent.removeChild(parent.firstChild);
    let rgb = parseRgb(input.value);
    genPalette(titles, modes, rgb, select.value);
});