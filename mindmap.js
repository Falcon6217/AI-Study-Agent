/**
 * CogniStudy AI - Interactive Concept Mind Map Engine
 * HTML5 Canvas dynamic graph explorer with node dragging, zoom, and deep dive links
 */

class MindmapController {
  constructor() {
    this.canvas = document.getElementById('mindmapCanvas');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.data = window.SAMPLE_DATA ? window.SAMPLE_DATA.mindmapData : null;

    this.nodes = [];
    this.links = [];
    this.selectedNode = null;
    this.draggingNode = null;
    this.panOffset = { x: 0, y: 0 };
    this.isPanning = false;
    this.startPan = { x: 0, y: 0 };
    this.scale = 1.0;

    if (this.canvas) {
      this.initEvents();
      this.buildGraphFromData();
      this.resizeCanvas();
      window.addEventListener('resize', () => this.resizeCanvas());
    }
  }

  resizeCanvas() {
    if (!this.canvas) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
    this.draw();
  }

  buildGraphFromData() {
    if (!this.data) return;
    this.nodes = [];
    this.links = [];

    const centerX = (this.canvas ? this.canvas.width : 800) / 2;
    const centerY = (this.canvas ? this.canvas.height : 600) / 2;

    const traverse = (node, depth, angle, parentNode) => {
      const radius = depth * 140;
      const x = depth === 0 ? centerX : centerX + Math.cos(angle) * radius;
      const y = depth === 0 ? centerY : centerY + Math.sin(angle) * radius;

      const graphNode = {
        id: node.id,
        label: node.label,
        color: node.color || '#6366f1',
        depth: depth,
        x: x,
        y: y,
        vx: 0,
        vy: 0,
        radius: depth === 0 ? 34 : depth === 1 ? 26 : 20
      };

      this.nodes.push(graphNode);

      if (parentNode) {
        this.links.push({ source: parentNode, target: graphNode });
      }

      if (node.children && node.children.length) {
        const span = Math.PI * (depth === 0 ? 2 : 0.8);
        const start = depth === 0 ? 0 : angle - span / 2;
        const step = span / node.children.length;

        node.children.forEach((child, idx) => {
          traverse(child, depth + 1, start + idx * step, graphNode);
        });
      }
    };

    traverse(this.data, 0, 0, null);
  }

  initEvents() {
    this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
    this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
    window.addEventListener('mouseup', () => this.onMouseUp());
    this.canvas.addEventListener('wheel', (e) => this.onWheel(e));
  }

  getCanvasCoords(e) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left - this.panOffset.x) / this.scale,
      y: (e.clientY - rect.top - this.panOffset.y) / this.scale
    };
  }

  onMouseDown(e) {
    const pos = this.getCanvasCoords(e);
    const clicked = this.nodes.find(n => {
      const dx = n.x - pos.x;
      const dy = n.y - pos.y;
      return Math.sqrt(dx * dx + dy * dy) <= n.radius;
    });

    if (clicked) {
      this.draggingNode = clicked;
      this.selectedNode = clicked;
    } else {
      this.isPanning = true;
      this.startPan = { x: e.clientX - this.panOffset.x, y: e.clientY - this.panOffset.y };
    }
    this.draw();
  }

  onMouseMove(e) {
    if (this.draggingNode) {
      const pos = this.getCanvasCoords(e);
      this.draggingNode.x = pos.x;
      this.draggingNode.y = pos.y;
      this.draw();
    } else if (this.isPanning) {
      this.panOffset.x = e.clientX - this.startPan.x;
      this.panOffset.y = e.clientY - this.startPan.y;
      this.draw();
    }
  }

  onMouseUp() {
    this.draggingNode = null;
    this.isPanning = false;
  }

  onWheel(e) {
    e.preventDefault();
    const zoomFactor = 1.1;
    if (e.deltaY < 0) {
      this.scale = Math.min(2.5, this.scale * zoomFactor);
    } else {
      this.scale = Math.max(0.4, this.scale / zoomFactor);
    }
    this.draw();
  }

  zoomIn() {
    this.scale = Math.min(2.5, this.scale * 1.2);
    this.draw();
  }

  zoomOut() {
    this.scale = Math.max(0.4, this.scale / 1.2);
    this.draw();
  }

  resetView() {
    this.scale = 1.0;
    this.panOffset = { x: 0, y: 0 };
    this.buildGraphFromData();
    this.draw();
  }

  draw() {
    if (!this.ctx || !this.canvas) return;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.save();
    ctx.translate(this.panOffset.x, this.panOffset.y);
    ctx.scale(this.scale, this.scale);

    // Draw Links
    this.links.forEach(link => {
      ctx.beginPath();
      ctx.moveTo(link.source.x, link.source.y);
      ctx.lineTo(link.target.x, link.target.y);
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.35)';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // Draw Nodes
    this.nodes.forEach(node => {
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      ctx.fillStyle = node.color || '#6366f1';
      ctx.shadowColor = node.color || '#6366f1';
      ctx.shadowBlur = this.selectedNode === node ? 20 : 8;
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.lineWidth = this.selectedNode === node ? 3 : 1.5;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      // Node Label
      ctx.fillStyle = '#f8fafc';
      ctx.font = `${node.depth === 0 ? '700 13px' : '600 11px'} 'Outfit', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.label, node.x, node.y + node.radius + 16);
    });

    ctx.restore();
  }

  exploreSelectedNode() {
    if (!this.selectedNode) {
      window.app?.showToast('Click a concept node on the map first!', 'info');
      return;
    }
    window.notesController?.exploreConcept(this.selectedNode.label);
  }

  exportImage() {
    if (!this.canvas) return;
    const link = document.createElement('a');
    link.download = 'cognistudy_mindmap.png';
    link.href = this.canvas.toDataURL();
    link.click();
    window.app?.showToast('Exported Mind Map image!', 'success');
  }
}

window.MindmapController = MindmapController;
