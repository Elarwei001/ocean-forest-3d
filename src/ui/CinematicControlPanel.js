// 电影级控制面板 - 嵌入式UI组件
// Cinematic Control Panel - Embedded UI Component

class CinematicControlPanel {
    constructor() {
        this.isOpen = false;
        this.panel = null;
        this.consoleOutput = null;
        this.systemStatus = {};
        
        this.init();
    }
    
    init() {
        this.createPanel();
        this.attachEventListeners();
        this.startStatusUpdates();
    }
    
    createPanel() {
        // 创建主面板容器
        this.panel = document.createElement('div');
        this.panel.id = 'cinematic-control-panel';
        this.panel.innerHTML = `
            <div class="panel-header">
                <div class="title">🎬 电影级控制</div>
                <div class="toggle-btn" onclick="cinematicPanel.toggle()">
                    <span class="toggle-icon">▼</span>
                </div>
            </div>
            
            <div class="panel-content">
                <!-- 系统状态 -->
                <div class="section">
                    <h3>🔧 系统状态</h3>
                    <div class="status-grid">
                        <div class="status-item">
                            <span>基础系统</span>
                            <span class="status" id="status-base">检查中...</span>
                        </div>
                        <div class="status-item">
                            <span>电影动画</span>
                            <span class="status" id="status-cinematic">检查中...</span>
                        </div>
                        <div class="status-item">
                            <span>粒子系统</span>
                            <span class="status" id="status-particles">检查中...</span>
                        </div>
                        <div class="status-item">
                            <span>AI行为</span>
                            <span class="status" id="status-behavior">检查中...</span>
                        </div>
                        <div class="status-item">
                            <span>摄像机</span>
                            <span class="status" id="status-camera">检查中...</span>
                        </div>
                    </div>
                </div>
                
                <!-- 快速控制 -->
                <div class="section">
                    <h3>⚡ 快速控制</h3>
                    <div class="control-row">
                        <button class="btn btn-primary" onclick="cinematicPanel.loadSystems()">
                            加载电影级系统
                        </button>
                        <button class="btn btn-secondary" onclick="cinematicPanel.checkStatus()">
                            刷新状态
                        </button>
                    </div>
                </div>
                
                <!-- 摄像机控制 -->
                <div class="section">
                    <h3>📹 摄像机模式</h3>
                    <div class="control-grid">
                        <button class="btn btn-cam" onclick="cinematicPanel.setCameraMode('follow')">跟随</button>
                        <button class="btn btn-cam" onclick="cinematicPanel.setCameraMode('cinematic')">电影</button>
                        <button class="btn btn-cam" onclick="cinematicPanel.setCameraMode('orbit')">环绕</button>
                        <button class="btn btn-cam" onclick="cinematicPanel.setCameraMode('documentary')">纪录片</button>
                    </div>
                    
                    <div class="control-row">
                        <button class="btn btn-effect" onclick="cinematicPanel.dollyZoom()">
                            🎯 希区柯克变焦
                        </button>
                        <button class="btn btn-effect" onclick="cinematicPanel.toggleShake()">
                            📳 摄像机震动
                        </button>
                    </div>
                </div>
                
                <!-- 粒子效果 -->
                <div class="section">
                    <h3>✨ 粒子效果</h3>
                    <div class="slider-group">
                        <label>气泡密度: <span id="bubble-value">1.0</span></label>
                        <input type="range" min="0" max="3" step="0.1" value="1" 
                               oninput="cinematicPanel.adjustParticles('bubbles', this.value)">
                    </div>
                    <div class="slider-group">
                        <label>生物发光: <span id="plankton-value">1.0</span></label>
                        <input type="range" min="0" max="3" step="0.1" value="1" 
                               oninput="cinematicPanel.adjustParticles('plankton', this.value)">
                    </div>
                    <div class="slider-group">
                        <label>海洋雪: <span id="snow-value">1.0</span></label>
                        <input type="range" min="0" max="3" step="0.1" value="1" 
                               oninput="cinematicPanel.adjustParticles('marineSnow', this.value)">
                    </div>
                </div>
                
                <!-- 性能监控 -->
                <div class="section">
                    <h3>📊 性能监控</h3>
                    <div class="performance-stats">
                        <div class="stat">
                            <span>FPS: </span>
                            <span id="fps-display">60</span>
                        </div>
                        <div class="stat">
                            <span>三角形: </span>
                            <span id="triangles-display">0</span>
                        </div>
                        <div class="stat">
                            <span>渲染调用: </span>
                            <span id="calls-display">0</span>
                        </div>
                    </div>
                </div>
                
                <!-- 控制台输出 -->
                <div class="section">
                    <h3>💻 控制台</h3>
                    <div class="console-output" id="panel-console">
                        <div class="console-line">🎬 电影级控制面板已就绪</div>
                    </div>
                </div>
            </div>
        `;
        
        // 添加样式
        this.addStyles();
        
        // 添加到页面
        document.body.appendChild(this.panel);
        
        // 设置引用
        this.consoleOutput = document.getElementById('panel-console');
        
        // 初始状态为折叠
        this.panel.classList.add('collapsed');
    }
    
    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            #cinematic-control-panel {
                position: fixed;
                top: 20px;
                right: 350px;
                width: 320px;
                background: rgba(0, 17, 34, 0.9);
                backdrop-filter: blur(8px);
                border: 1px solid rgba(79, 195, 247, 0.4);
                border-radius: 8px;
                color: white;
                font-family: 'Arial', sans-serif;
                z-index: 50000;
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
                transition: all 0.3s ease;
                max-height: 90vh;
                overflow-y: auto;
            }
            
            #cinematic-control-panel.collapsed .panel-content {
                display: none;
            }
            
            #cinematic-control-panel.collapsed {
                width: 200px;
            }
            
            .panel-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px;
                border-bottom: 1px solid rgba(135, 206, 235, 0.2);
                cursor: pointer;
                user-select: none;
            }
            
            .title {
                font-weight: bold;
                font-size: 1.1em;
            }
            
            .toggle-btn {
                padding: 5px;
                border-radius: 50%;
                background: rgba(79, 195, 247, 0.2);
                transition: all 0.3s ease;
            }
            
            .toggle-btn:hover {
                background: rgba(79, 195, 247, 0.4);
            }
            
            .toggle-icon {
                display: inline-block;
                transition: transform 0.3s ease;
            }
            
            #cinematic-control-panel.collapsed .toggle-icon {
                transform: rotate(-90deg);
            }
            
            .panel-content {
                padding: 15px;
            }
            
            .section {
                margin-bottom: 20px;
                border-bottom: 1px solid rgba(135, 206, 235, 0.1);
                padding-bottom: 15px;
            }
            
            .section:last-child {
                border-bottom: none;
                margin-bottom: 0;
            }
            
            .section h3 {
                margin: 0 0 10px 0;
                font-size: 0.9em;
                color: #87CEEB;
                font-weight: bold;
            }
            
            .status-grid {
                display: grid;
                gap: 8px;
            }
            
            .status-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 5px 0;
                font-size: 0.85em;
            }
            
            .status {
                padding: 3px 8px;
                border-radius: 12px;
                font-size: 0.75em;
                font-weight: bold;
            }
            
            .status.available {
                background: #4CAF50;
                color: white;
            }
            
            .status.loading {
                background: #FF9800;
                color: white;
            }
            
            .status.error {
                background: #f44336;
                color: white;
            }
            
            .control-row, .control-grid {
                display: flex;
                gap: 8px;
                flex-wrap: wrap;
                margin-bottom: 10px;
            }
            
            .control-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 6px;
            }
            
            .btn {
                padding: 8px 12px;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 0.8em;
                font-weight: bold;
                transition: all 0.2s ease;
                flex: 1;
            }
            
            .btn-primary {
                background: linear-gradient(135deg, #4FC3F7, #29B6F6);
                color: white;
            }
            
            .btn-secondary {
                background: rgba(255, 255, 255, 0.1);
                color: white;
                border: 1px solid rgba(255, 255, 255, 0.2);
            }
            
            .btn-cam {
                background: rgba(135, 206, 235, 0.2);
                color: #87CEEB;
                border: 1px solid rgba(135, 206, 235, 0.3);
            }
            
            .btn-effect {
                background: rgba(255, 193, 7, 0.2);
                color: #FFC107;
                border: 1px solid rgba(255, 193, 7, 0.3);
            }
            
            .btn:hover {
                transform: translateY(-1px);
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
                opacity: 0.9;
            }
            
            .btn:active {
                transform: translateY(0);
            }
            
            .slider-group {
                margin-bottom: 10px;
            }
            
            .slider-group label {
                display: block;
                font-size: 0.8em;
                margin-bottom: 5px;
                color: #B3E5FC;
            }
            
            .slider-group input[type="range"] {
                width: 100%;
                height: 4px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 2px;
                outline: none;
            }
            
            .slider-group input[type="range"]::-webkit-slider-thumb {
                appearance: none;
                width: 16px;
                height: 16px;
                background: #4FC3F7;
                border-radius: 50%;
                cursor: pointer;
            }
            
            .performance-stats {
                display: grid;
                gap: 5px;
                font-size: 0.8em;
            }
            
            .stat {
                display: flex;
                justify-content: space-between;
                padding: 3px 0;
            }
            
            .console-output {
                background: rgba(0, 0, 0, 0.5);
                border: 1px solid rgba(0, 255, 0, 0.3);
                border-radius: 4px;
                padding: 10px;
                height: 120px;
                overflow-y: auto;
                font-family: 'Courier New', monospace;
                font-size: 0.75em;
                color: #00ff00;
                line-height: 1.3;
            }
            
            .console-line {
                margin-bottom: 2px;
                word-wrap: break-word;
            }
            
            .console-line.error {
                color: #ff6b6b;
            }
            
            .console-line.warn {
                color: #ffd93d;
            }
            
            .console-line.success {
                color: #6bcf7f;
            }
            
            /* 滚动条样式 */
            #cinematic-control-panel::-webkit-scrollbar,
            .console-output::-webkit-scrollbar {
                width: 6px;
            }
            
            #cinematic-control-panel::-webkit-scrollbar-track,
            .console-output::-webkit-scrollbar-track {
                background: rgba(0, 0, 0, 0.2);
            }
            
            #cinematic-control-panel::-webkit-scrollbar-thumb,
            .console-output::-webkit-scrollbar-thumb {
                background: rgba(135, 206, 235, 0.5);
                border-radius: 3px;
            }
            
            /* 移动端适配 */
            @media (max-width: 768px) {
                #cinematic-control-panel {
                    width: 280px;
                    right: 10px;
                    top: 10px;
                }
                
                #cinematic-control-panel.collapsed {
                    width: 160px;
                }
                
                .control-grid {
                    grid-template-columns: 1fr;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
    
    attachEventListeners() {
        // 点击头部切换展开/折叠
        this.panel.querySelector('.panel-header').addEventListener('click', () => {
            this.toggle();
        });
    }
    
    toggle() {
        this.isOpen = !this.isOpen;
        this.panel.classList.toggle('collapsed', !this.isOpen);
    }
    
    log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const line = document.createElement('div');
        line.className = `console-line ${type}`;
        line.textContent = `[${timestamp}] ${message}`;
        
        this.consoleOutput.appendChild(line);
        this.consoleOutput.scrollTop = this.consoleOutput.scrollHeight;
        
        // 限制控制台行数
        const lines = this.consoleOutput.children;
        if (lines.length > 50) {
            this.consoleOutput.removeChild(lines[0]);
        }
    }
    
    checkStatus() {
        this.log('检查系统状态...');
        
        // 检查基础系统
        const baseSystem = window.oceanForest;
        this.updateStatus('base', baseSystem ? 'available' : 'error', 
                         baseSystem ? '✅ 运行中' : '❌ 未加载');
        
        if (baseSystem) {
            this.log('基础海洋森林系统: ✅ 运行中', 'success');
            
            // 检查高级系统
            const systems = [
                { key: 'cinematicAnimation', id: 'cinematic', name: '电影级动画系统' },
                { key: 'advancedParticles', id: 'particles', name: '高级粒子系统' },
                { key: 'marineLifeBehavior', id: 'behavior', name: '海洋生物AI行为' },
                { key: 'cinematicCamera', id: 'camera', name: '电影级摄像机' }
            ];
            
            systems.forEach(system => {
                const isAvailable = baseSystem[system.key];
                this.updateStatus(system.id, isAvailable ? 'available' : 'error',
                                isAvailable ? '✅ 已启用' : '❌ 未启用');
                this.log(`${system.name}: ${isAvailable ? '✅ 已启用' : '❌ 未启用'}`, 
                        isAvailable ? 'success' : 'error');
            });
        } else {
            this.log('基础系统未找到，请确保主页面已加载', 'error');
        }
        
        this.updatePerformanceStats();
    }
    
    updateStatus(id, status, text) {
        const element = document.getElementById(`status-${id}`);
        if (element) {
            element.className = `status ${status}`;
            element.textContent = text;
        }
    }
    
    loadSystems() {
        this.log('尝试加载电影级系统...', 'info');
        
        if (!window.oceanForest) {
            this.log('错误: 基础系统未找到', 'error');
            return;
        }
        
        try {
            if (window.oceanForest.initOptionalSystems) {
                window.oceanForest.initOptionalSystems();
                this.log('电影级系统初始化完成', 'success');
            } else {
                this.log('请确保已添加电影级系统脚本到HTML', 'warn');
            }
            
            setTimeout(() => this.checkStatus(), 1000);
            
        } catch (error) {
            this.log(`初始化失败: ${error.message}`, 'error');
        }
    }
    
    setCameraMode(mode) {
        if (!window.oceanForest?.cinematicCamera) {
            this.log('电影级摄像机系统未启用', 'warn');
            return;
        }
        
        try {
            const modeSettings = {
                follow: { smoothness: 0.08 },
                cinematic: { shakingIntensity: 0.05, fov: 35 },
                orbit: { radius: 20, speed: 0.3 },
                documentary: { handheldAmount: 0.04 }
            };
            
            window.oceanForest.cinematicCamera.setMode(mode, modeSettings[mode] || {});
            this.log(`摄像机模式: ${mode}`, 'success');
            
        } catch (error) {
            this.log(`摄像机切换失败: ${error.message}`, 'error');
        }
    }
    
    dollyZoom() {
        if (!window.oceanForest?.cinematicCamera) {
            this.log('电影级摄像机系统未启用', 'warn');
            return;
        }
        
        try {
            window.oceanForest.cinematicCamera.dollyZoom(85, 3.0);
            this.log('希区柯克变焦效果已启动', 'success');
        } catch (error) {
            this.log(`变焦效果失败: ${error.message}`, 'error');
        }
    }
    
    toggleShake() {
        if (!window.oceanForest?.cinematicCamera) {
            this.log('电影级摄像机系统未启用', 'warn');
            return;
        }
        
        try {
            // 简单的开关逻辑
            this.shakeEnabled = !this.shakeEnabled;
            if (this.shakeEnabled) {
                window.oceanForest.cinematicCamera.enableShake(0.1);
                this.log('摄像机震动已启用', 'success');
            } else {
                window.oceanForest.cinematicCamera.disableShake();
                this.log('摄像机震动已禁用', 'success');
            }
        } catch (error) {
            this.log(`震动切换失败: ${error.message}`, 'error');
        }
    }
    
    adjustParticles(type, value) {
        const numValue = parseFloat(value);
        document.getElementById(`${type === 'marineSnow' ? 'snow' : type}-value`).textContent = numValue.toFixed(1);
        
        if (!window.oceanForest?.advancedParticles) {
            this.log('高级粒子系统未启用', 'warn');
            return;
        }
        
        try {
            window.oceanForest.advancedParticles.adjustParticleDensity(type, numValue);
            this.log(`${type}密度: ${numValue.toFixed(1)}x`, 'success');
        } catch (error) {
            this.log(`粒子调整失败: ${error.message}`, 'error');
        }
    }
    
    updatePerformanceStats() {
        if (!window.oceanForest?.renderEngine) return;
        
        try {
            const stats = window.oceanForest.renderEngine.getRenderStats();
            document.getElementById('fps-display').textContent = stats.fps || '60';
            document.getElementById('triangles-display').textContent = 
                (stats.triangles || 0).toLocaleString();
            document.getElementById('calls-display').textContent = stats.calls || '0';
        } catch (error) {
            // 静默失败，避免控制台垃圾信息
        }
    }
    
    startStatusUpdates() {
        // 初始状态检查
        setTimeout(() => this.checkStatus(), 1000);
        
        // 定期更新状态
        setInterval(() => this.checkStatus(), 5000);
        
        // 定期更新性能统计
        setInterval(() => this.updatePerformanceStats(), 1000);
    }
}

// 注册到模块管理器
if (window.moduleManager) {
    window.moduleManager.registerModule('CinematicControlPanel', CinematicControlPanel);
}

// 导出类供全局使用
window.CinematicControlPanel = CinematicControlPanel;

// 全局实例变量
window.cinematicPanel = null;

console.log('🎬 电影级控制面板脚本已加载');
console.log('CinematicControlPanel类已可用:', !!window.CinematicControlPanel);

// 等待DOM完全加载后再创建实例
function initControlPanel() {
    if (document.body && !window.cinematicPanel) {
        try {
            console.log('🧪 创建电影级控制面板实例...');
            window.cinematicPanel = new CinematicControlPanel();
            console.log('✅ 控制面板已成功创建');
            
            // 验证面板是否在页面中
            const panel = document.getElementById('cinematic-control-panel');
            if (panel) {
                console.log('📍 控制面板位置:', panel.getBoundingClientRect());
            }
        } catch (error) {
            console.error('❌ 控制面板创建失败:', error);
        }
    }
}

// 尝试在不同时机初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initControlPanel);
} else {
    setTimeout(initControlPanel, 100);
}