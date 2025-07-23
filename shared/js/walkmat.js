// 보행매트 제품 데이터
const WALKMAT_PRODUCTS = [
    { id: "DB-600", code: "24383984", thickness: 30, width: 600, type: "DB", price: 17500, spec: "600 × t30mm" },
    { id: "DB-800", code: "24383985", thickness: 30, width: 800, type: "DB", price: 18900, spec: "800 × t30mm" },
    { id: "DB-1000", code: "23820461", thickness: 30, width: 1000, type: "DB", price: 20500, spec: "1000 × t30mm" },
    { id: "DB-1200", code: "23820462", thickness: 30, width: 1200, type: "DB", price: 25000, spec: "1200 × t30mm" },
    { id: "DB-1500", code: "23816090", thickness: 30, width: 1500, type: "DB", price: 32000, spec: "1500 × t30mm" },
    { id: "DB-1800", code: "24383986", thickness: 30, width: 1800, type: "DB", price: 42900, spec: "1800 × t30mm" },
    { id: "DB-2000", code: "24383987", thickness: 30, width: 2000, type: "DB", price: 45000, spec: "2000 × t30mm" },
    { id: "DBM-1000", code: "24022659", thickness: 30, width: 1000, type: "DBM", price: 34500, spec: "1000 × t30mm" },
    { id: "DBM-1200", code: "24022658", thickness: 30, width: 1200, type: "DBM", price: 37000, spec: "1200 × t30mm" },
    { id: "DBM-1500", code: "24022657", thickness: 30, width: 1500, type: "DBM", price: 47900, spec: "1500 × t30mm" },
    { id: "DB-3506", code: "25217275", thickness: 35, width: 600, type: "DB", price: 17900, spec: "600 × t35mm" },
    { id: "DB-3508", code: "25217276", thickness: 35, width: 800, type: "DB", price: 18900, spec: "800 × t35mm" },
    { id: "DB-3510", code: "25150092", thickness: 35, width: 1000, type: "DB", price: 21900, spec: "1000 × t35mm" },
    { id: "DB-3512", code: "25150093", thickness: 35, width: 1200, type: "DB", price: 25900, spec: "1200 × t35mm" },
    { id: "DB-3515", code: "25150094", thickness: 35, width: 1500, type: "DB", price: 32900, spec: "1500 × t35mm" },
    { id: "DB-3520", code: "25150095", thickness: 35, width: 2000, type: "DB", price: 49900, spec: "2000 × t35mm" }
];

// 보행매트 부속품 데이터
const WALKMAT_ACCESSORIES = [
    { id: "DB-P1", code: "23816084", name: "철판 (15×200×t1mm)", price: 250, note: "부드러운 지반에 사용" },
    { id: "DB-P2", code: "23816086", name: "철근 (Φ10×250mm)", price: 600, note: "암석 지반에 사용" },
    { id: "DB-P3", code: "25488231", name: "철근 (Φ10×300mm)", price: 500, note: "암석 지반에 사용" }
];

// 보행매트 계산기 클래스
class WalkmatCalculator {
    
    constructor() {
        this.matCount = 1;
        this.quoteTable = new QuoteTable('quoteItems', 'totalAmount');
        this.initializeEventListeners();
        this.setupInitialMat();
    }
    
    // 초기 이벤트 리스너 설정
    initializeEventListeners() {
        // 계산 버튼
        const calculateBtn = document.getElementById('calculateBtn');
        if (calculateBtn) {
            calculateBtn.addEventListener('click', () => this.calculateQuote());
        }
        
        // 매트 추가 버튼
        const addMatBtn = document.getElementById('addMatBtn');
        if (addMatBtn) {
            addMatBtn.addEventListener('click', () => this.addNewMatSelection());
        }
        
        // 이메일 발송 버튼
        const emailBtn = document.getElementById('emailBtn');
        if (emailBtn) {
            emailBtn.addEventListener('click', () => this.handleEmailSend());
        }
        
        // 새 견적 작성 버튼
        const newQuoteBtn = document.getElementById('newQuoteBtn');
        if (newQuoteBtn) {
            newQuoteBtn.addEventListener('click', () => this.handleNewQuote());
        }
    }
    
    // 초기 매트 설정
    setupInitialMat() {
        this.setupEventListeners(0);
        this.updateWidthOptions(0);
    }
    
    // 매트별 이벤트 리스너 설정
    setupEventListeners(index) {
        const thicknessSelect = document.getElementById(`thickness-${index}`);
        const typeSelect = document.getElementById(`type-${index}`);
        
        if (thicknessSelect) {
            thicknessSelect.addEventListener('change', () => {
                this.updateWidthOptions(index);
            });
        }
        
        if (typeSelect) {
            typeSelect.addEventListener('change', () => {
                this.updateWidthOptions(index);
            });
        }
    }
    
    // 폭 옵션 업데이트
    updateWidthOptions(index) {
        const thicknessSelect = document.getElementById(`thickness-${index}`);
        const typeSelect = document.getElementById(`type-${index}`);
        const widthSelect = document.getElementById(`width-${index}`);
        
        if (!thicknessSelect || !typeSelect || !widthSelect) return;
        
        const thickness = parseInt(thicknessSelect.value);
        const type = typeSelect.value;
        
        // 기존 옵션 제거
        while (widthSelect.options.length > 0) {
            widthSelect.remove(0);
        }
        
        // 필터링된 제품 목록
        const filteredProducts = WALKMAT_PRODUCTS.filter(p => p.thickness === thickness && p.type === type);
        
        if (filteredProducts.length === 0) {
            // 해당 조건의 제품이 없는 경우
            if (type === "DBM") {
                alert("경사형(DBM)은 30mm 두께의 1000~1500mm 폭 제품만 가능합니다.");
                typeSelect.value = "DB";
                this.updateWidthOptions(index);
                return;
            }
            
            // 일반 제품 목록 표시
            WALKMAT_PRODUCTS.filter(p => p.thickness === thickness && p.type === "DB")
                .forEach(product => {
                    const option = document.createElement('option');
                    option.value = product.width;
                    option.textContent = `${product.width}mm`;
                    if (product.width === 1000) {
                        option.selected = true;
                    }
                    widthSelect.appendChild(option);
                });
        } else {
            // 필터링된 제품 목록 표시
            filteredProducts.forEach(product => {
                const option = document.createElement('option');
                option.value = product.width;
                option.textContent = `${product.width}mm`;
                if (product.width === 1000) {
                    option.selected = true;
                }
                widthSelect.appendChild(option);
            });
        }
    }
    
    // 새 매트 선택 추가
    addNewMatSelection() {
        const matSelections = document.getElementById('matSelections');
        const newMatIndex = matSelections.children.length;
        const displayIndex = newMatIndex + 1;
        
        const matDiv = document.createElement('div');
        matDiv.className = 'mat-selection border-b pb-6 mb-6';
        matDiv.innerHTML = `
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-medium text-gray-800">매트 #${displayIndex}</h3>
                <button class="remove-mat text-red-500 hover:text-red-700" data-index="${newMatIndex}">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                </button>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-4">
                    <div class="form-group">
                        <label for="thickness-${newMatIndex}" class="form-label">두께 선택</label>
                        <select id="thickness-${newMatIndex}" class="form-select">
                            <option value="30">30mm</option>
                            <option value="35">35mm</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="width-${newMatIndex}" class="form-label">폭 선택 (mm)</label>
                        <select id="width-${newMatIndex}" class="form-select">
                            <option value="1000" selected>1000mm</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="type-${newMatIndex}" class="form-label">타입 선택</label>
                        <select id="type-${newMatIndex}" class="form-select">
                            <option value="DB">일반형 (DB)</option>
                            <option value="DBM">경사형 (DBM) - 1000~1500mm만 가능</option>
                        </select>
                    </div>
                </div>
                
                <div class="space-y-4">
                    <div class="form-group">
                        <label for="length-${newMatIndex}" class="form-label">길이 (m)</label>
                        <input type="number" id="length-${newMatIndex}" class="form-input" min="1" value="1">
                    </div>
                </div>
            </div>
        `;
        
        matSelections.appendChild(matDiv);
        this.matCount++;
        
        // 삭제 버튼 이벤트
        const removeBtn = matDiv.querySelector('.remove-mat');
        removeBtn.addEventListener('click', function() {
            matDiv.remove();
        });
        
        // 새로 추가된 매트의 이벤트 리스너 설정
        this.setupEventListeners(newMatIndex);
        this.updateWidthOptions(newMatIndex);
    }
    
    // 견적 계산
    calculateQuote() {
        this.quoteTable.clear();
        
        // 모든 매트 선택 처리
        const matSelections = document.querySelectorAll('.mat-selection');
        
        for (let i = 0; i < matSelections.length; i++) {
            const thicknessSelect = document.getElementById(`thickness-${i}`);
            const widthSelect = document.getElementById(`width-${i}`);
            const typeSelect = document.getElementById(`type-${i}`);
            const lengthInput = document.getElementById(`length-${i}`);
            
            if (!thicknessSelect || !widthSelect || !typeSelect || !lengthInput) continue;
            
            const thickness = parseInt(thicknessSelect.value);
            const width = parseInt(widthSelect.value);
            const type = typeSelect.value;
            const length = parseInt(lengthInput.value);
            
            const product = WALKMAT_PRODUCTS.find(p => 
                p.thickness === thickness && 
                p.width === width && 
                p.type === type
            );
            
            if (!product) {
                alert(`매트 #${i+1}: 선택한 조건에 맞는 제품이 없습니다.`);
                return;
            }
            
            this.quoteTable.addItem(
                product.id, 
                product.code, 
                "보행매트", 
                product.spec, 
                product.price, 
                length,
                'walkmat'
            );
        }
        
        // 부속품 처리
        this.processAccessories();
        
        // 결과 표시
        const resultContainer = document.getElementById('resultContainer');
        resultContainer.classList.remove('hidden');
        resultContainer.scrollIntoView({ behavior: 'smooth' });
    }
    
    // 부속품 처리
    processAccessories() {
        const accessory1Qty = parseInt(document.getElementById('accessory1').value);
        const accessory2Qty = parseInt(document.getElementById('accessory2').value);
        const accessory3Qty = parseInt(document.getElementById('accessory3').value);
        
        if (accessory1Qty > 0) {
            this.quoteTable.addItem(
                WALKMAT_ACCESSORIES[0].id, 
                WALKMAT_ACCESSORIES[0].code, 
                WALKMAT_ACCESSORIES[0].name, 
                "-", 
                WALKMAT_ACCESSORIES[0].price, 
                accessory1Qty,
                'accessory'
            );
        }
        
        if (accessory2Qty > 0) {
            this.quoteTable.addItem(
                WALKMAT_ACCESSORIES[1].id, 
                WALKMAT_ACCESSORIES[1].code, 
                WALKMAT_ACCESSORIES[1].name, 
                "-", 
                WALKMAT_ACCESSORIES[1].price, 
                accessory2Qty,
                'accessory'
            );
        }
        
        if (accessory3Qty > 0) {
            this.quoteTable.addItem(
                WALKMAT_ACCESSORIES[2].id, 
                WALKMAT_ACCESSORIES[2].code, 
                WALKMAT_ACCESSORIES[2].name, 
                "-", 
                WALKMAT_ACCESSORIES[2].price, 
                accessory3Qty,
                'accessory'
            );
        }
    }
    
    // 견적 데이터 수집
    collectQuoteData() {
        const customerName = document.getElementById('customerName').value.trim();
        const customerPhone = document.getElementById('customerPhone').value.trim();
        const customerEmail = document.getElementById('customerEmail').value.trim();
        
        const items = this.quoteTable.collectQuoteData();
        
        return {
            customerName: customerName,
            email: customerEmail,
            phone: customerPhone,
            productType: '보행매트',
            items: items,
            totalAmount: this.quoteTable.total,
            privacyConsent: true,
            timestamp: new Date().toISOString()
        };
    }
    
// 이메일 발송 처리
async handleEmailSend() {
    // 고객 정보 유효성 검사
    if (!Validator.validateCustomerInfo()) {
        return;
    }
    
    // 개인정보 동의 체크 확인
    const privacyConsent = document.getElementById('privacyConsent');
    if (!privacyConsent.checked) {
        alert('개인정보 수집·이용에 동의해주세요.');
        return;
    }
    
    const emailBtn = document.getElementById('emailBtn');
    // ... 나머지 코드
}        
        const emailBtn = document.getElementById('emailBtn');
        emailBtn.disabled = true;
        emailBtn.textContent = '발송 중...';
        
        try {
            const quoteData = this.collectQuoteData();
            await EmailService.sendQuote(quoteData);
            alert('✅ 견적서 발송 요청이 완료되었습니다!\n잠시 후 이메일을 확인해주세요.');
            
        } catch (error) {
            console.error('Error:', error);
            alert('❌ 견적서 발송에 실패했습니다.\n잠시 후 다시 시도해주세요.');
        } finally {
            emailBtn.disabled = false;
            emailBtn.textContent = '견적서 이메일 발송';
        }
    }
    
    // 새 견적 작성
    handleNewQuote() {
        // 추가된 매트들 제거 (첫 번째만 남기기)
        const matSelections = document.getElementById('matSelections');
        while (matSelections.children.length > 1) {
            matSelections.removeChild(matSelections.lastChild);
        }
        
        // 폼 리셋
        const resultContainer = document.getElementById('resultContainer');
        resultContainer.classList.add('hidden');
        
        document.getElementById('customerName').value = '';
        document.getElementById('customerPhone').value = '';
        document.getElementById('customerEmail').value = '';
        document.getElementById('accessory1').value = '0';
        document.getElementById('accessory2').value = '0';
        document.getElementById('accessory3').value = '0';
        
        const validationError = document.getElementById('validationError');
        if (validationError) {
            validationError.style.display = 'none';
        }
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// 디버그 정보 표시 함수 (전역 함수로 정의)
function showDebugInfo() {
    if (window.walkmatCalculator) {
        const quoteData = window.walkmatCalculator.collectQuoteData();
        DebugInfo.show(quoteData);
    }
}

// DOM이 로드된 후 보행매트 계산기 초기화
document.addEventListener('DOMContentLoaded', function() {
    // 공통 스크립트가 로드될 때까지 잠시 대기
    setTimeout(() => {
        window.walkmatCalculator = new WalkmatCalculator();
        console.log('✅ 보행매트 계산기 초기화 완료');
    }, 100);
});
