// 教育系统 - 交互式学习功能
// Education System - Interactive learning functionality

class EducationSystem {
    constructor(scene, camera, canvas) {
        this.scene = scene;
        this.camera = camera;
        this.canvas = canvas;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.clickableObjects = [];
        this.infoPanel = document.getElementById('species-info');
        this.closeBtn = document.getElementById('close-info');
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // 处理物种点击
        this.canvas.addEventListener('click', (event) => {
            event.preventDefault();
            this.handleClick(event);
        });
        
        // 处理关闭按钮
        this.closeBtn.addEventListener('click', () => {
            this.hideSpeciesInfo();
        });
        
        // ESC键关闭
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                this.hideSpeciesInfo();
            }
        });
    }
    
    registerClickableObject(object) {
        if (object.userData.species) {
            this.clickableObjects.push(object);
        }
    }
    
    handleClick(event) {
        // 计算鼠标位置
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        // 更新射线
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        // 计算交叉点
        const intersects = this.raycaster.intersectObjects(this.clickableObjects, true);
        
        let speciesFound = false;
        
        if (intersects.length > 0) {
            // 寻找具有物种数据的对象
            for (let intersect of intersects) {
                let obj = intersect.object;
                
                // 向上遍历层次结构
                while (obj && !obj.userData.species) {
                    obj = obj.parent;
                }
                
                if (obj && obj.userData.species) {
                    this.showSpeciesInfo(obj.userData.species);
                    speciesFound = true;
                    break;
                }
            }
        }
        
        // 如果没有点击物种，隐藏信息面板
        if (!speciesFound && !this.infoPanel.classList.contains('hidden')) {
            this.hideSpeciesInfo();
        }
    }
    
    showSpeciesInfo(speciesData) {
        const nameElement = document.getElementById('species-name');
        const englishElement = document.getElementById('species-english');
        const factsElement = document.getElementById('species-facts');
        const imageElement = document.getElementById('species-image');
        
        // 设置物种信息
        nameElement.textContent = speciesData.name;
        englishElement.textContent = speciesData.englishName;
        
        // 设置物种照片
        if (speciesData.photo) {
            imageElement.src = speciesData.photo;
            imageElement.alt = `${speciesData.englishName} photo`;
            imageElement.style.display = 'block';
        } else {
            // 创建简单的占位图
            imageElement.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMDA0NDY2Ii8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmaWxsPSIjODdDRUVCIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiPk1hcmluZSBBbmltYWw8L3RleHQ+Cjwvc3ZnPgo=";
            imageElement.alt = `${speciesData.englishName} placeholder`;
        }
        
        // 创建知识点列表
        const factsList = document.createElement('ul');
        speciesData.facts.forEach(fact => {
            const listItem = document.createElement('li');
            listItem.textContent = fact;
            factsList.appendChild(listItem);
        });
        
        // 清除之前的内容并添加新内容
        factsElement.innerHTML = '';
        factsElement.appendChild(factsList);
        
        // 显示面板
        this.infoPanel.classList.remove('hidden');
        
        // 隐藏浮动标签，避免干扰面板显示
        if (window.oceanForest && window.oceanForest.floatingLabels) {
            window.oceanForest.floatingLabels.hideLabels();
        }
        
        // 播放教育音效
        if (window.audioSystem) {
            window.audioSystem.playBubbleSound(1200, 0.3);
        }
    }
    
    hideSpeciesInfo() {
        this.infoPanel.classList.add('hidden');
        
        // 面板关闭时重新显示浮动标签
        if (window.oceanForest && window.oceanForest.floatingLabels) {
            window.oceanForest.floatingLabels.showLabels();
        }
    }
}

// 浮动标签系统 - 显示生物英文名
// Floating Labels System - Display species English names

class FloatingLabelsSystem {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.speciesLabels = [];
        this.labelsVisible = true; // 控制标签是否应该显示
    }
    
    createFloatingLabels(allSpecies) {
        allSpecies.forEach(species => {
            if (species.userData.species) {
                this.createSpeciesLabel(species);
            }
        });
        
        // 检查教育面板是否已经打开，如果是，隐藏标签
        const infoPanel = document.getElementById('species-info');
        if (infoPanel && !infoPanel.classList.contains('hidden')) {
            this.hideLabels();
        }
    }
    
    createSpeciesLabel(speciesObject) {
        const label = document.createElement('div');
        label.className = 'species-label fade-in';
        label.textContent = speciesObject.userData.species.englishName;
        
        // 存储3D对象引用
        label.speciesObject = speciesObject;
        speciesObject.userData.label = label;
        
        document.body.appendChild(label);
        this.speciesLabels.push(label);
        
        // 初始位置
        this.updateLabelPosition(label, speciesObject);
    }
    
    updateLabelPosition(label, speciesObject) {
        if (!speciesObject || !label) return;
        
        // 如果标签被设为隐藏，强制隐藏
        if (!this.labelsVisible) {
            label.style.display = 'none';
            return;
        }
        
        // 获取世界位置
        const worldPosition = new THREE.Vector3();
        speciesObject.getWorldPosition(worldPosition);
        
        // 投影到屏幕坐标
        const screenPosition = worldPosition.clone().project(this.camera);
        
        // 转换为像素坐标
        const x = (screenPosition.x * 0.5 + 0.5) * window.innerWidth;
        const y = (screenPosition.y * -0.5 + 0.5) * window.innerHeight;
        
        // 定位标签在物种上方
        label.style.left = (x - label.offsetWidth / 2) + 'px';
        label.style.top = (y - 40) + 'px';
        
        // 距离和可见性检查
        const distance = this.camera.position.distanceTo(worldPosition);
        const isVisible = screenPosition.z < 1 && distance < 100;
        label.style.display = isVisible ? 'block' : 'none';
    }
    
    updateFloatingLabels() {
        // 如果标签被设置为隐藏，跳过所有更新
        if (!this.labelsVisible) {
            return;
        }
        
        this.speciesLabels.forEach(label => {
            if (label.speciesObject && document.body.contains(label)) {
                this.updateLabelPosition(label, label.speciesObject);
            }
        });
    }
    
    // 隐藏所有浮动标签
    hideLabels() {
        this.labelsVisible = false; // 设置状态为隐藏
        this.speciesLabels.forEach(label => {
            if (label && document.body.contains(label)) {
                label.style.display = 'none';
            }
        });
    }
    
    // 显示所有浮动标签
    showLabels() {
        this.labelsVisible = true; // 重新启用标签显示
        this.speciesLabels.forEach(label => {
            if (label && label.speciesObject && document.body.contains(label)) {
                // 重新计算可见性
                const worldPosition = new THREE.Vector3();
                label.speciesObject.getWorldPosition(worldPosition);
                const screenPosition = worldPosition.clone().project(this.camera);
                const distance = this.camera.position.distanceTo(worldPosition);
                const isVisible = screenPosition.z < 1 && distance < 100;
                label.style.display = isVisible ? 'block' : 'none';
            }
        });
    }
    
    // 清理资源
    cleanup() {
        this.speciesLabels.forEach(label => {
            if (label.parentNode) {
                label.parentNode.removeChild(label);
            }
        });
        this.speciesLabels = [];
    }
}

// 注册模块
if (window.moduleManager) {
    window.moduleManager.registerModule('EducationSystem', EducationSystem);
    window.moduleManager.registerModule('FloatingLabelsSystem', FloatingLabelsSystem);
}