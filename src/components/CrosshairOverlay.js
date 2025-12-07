export default class CrosshairOverlay {
    constructor() {
        this.root = document.createElement('div');
        this.root.style.position = 'fixed';
        this.root.style.top = '50%';
        this.root.style.left = '50%';
        this.root.style.width = '20px';
        this.root.style.height = '20px';
        this.root.style.transform = 'translate(-50%, -50%)';
        this.root.style.pointerEvents = 'none';
        this.root.style.zIndex = '4';

        const vertical = document.createElement('div');
        vertical.style.position = 'absolute';
        vertical.style.left = '50%';
        vertical.style.top = '50%';
        vertical.style.width = '2px';
        vertical.style.height = '16px';
        vertical.style.background = '#ffffff';
        vertical.style.transform = 'translate(-50%, -50%)';

        const horizontal = document.createElement('div');
        horizontal.style.position = 'absolute';
        horizontal.style.left = '50%';
        horizontal.style.top = '50%';
        horizontal.style.width = '16px';
        horizontal.style.height = '2px';
        horizontal.style.background = '#ffffff';
        horizontal.style.transform = 'translate(-50%, -50%)';

        this.root.appendChild(vertical);
        this.root.appendChild(horizontal);

        document.body.appendChild(this.root);
    }
}
