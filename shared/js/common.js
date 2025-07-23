// 공통 설정
const CONFIG = {
    APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbxvHiL8r8blscWYeJUKCHLZ08CHLxuNhkdzAO9YwJs8Qrrs-0D889f6SjLZLzb0Fxq2mQ/exec',
    COMPANY_INFO: {
        name: '두발로㈜',
        phone: '031-866-8872',
        email: 'quitesotrue@gmail.com'
    }
};

// 공통 유틸리티 함수들
class CommonUtils {
    
    // 금액 포맷팅
    static formatCurrency(amount) {
        return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    
    // 날짜 계산
    static getExpiryDate() {
        const today = new Date();
        const oneMonthLater = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
        return `${oneMonthLater.getFullYear()}년 ${oneMonthLater.getMonth() + 1}월 ${oneMonthLater.getDate()}일`;
    }
    
    // 연락처 자동 포맷팅
    static formatPhoneNumber(phoneNumber) {
        let value = phoneNumber.replace(/[^0-9]/g, ''); // 숫자만 남기기
        
        if (value.length >= 3) {
            if (value.length <= 7) {
                // 010-1234 형태
                value = value.substring(0, 3) + '-' + value.substring(3);
            } else {
                // 010-1234-5678 형태
                value = value.substring(0, 3) + '-' + value.substring(3, 7) + '-' + value.substring(7, 11);
            }
        }
        
        return value;
    }
}

// 유효성 검사 클래스
class Validator {
    
    // 고객 정보 유효성 검사
    static validateCustomerInfo() {
        const customerName = document.getElementById('customerName').value.trim();
        const customerPhone = document.getElementById('customerPhone').value.trim();
        const customerEmail = document.getElementById('customerEmail').value.trim();
        const validationError = document.getElementById('validationError');
        
        // 고객명 검사
        if (!customerName || customerName.length < 2) {
            this.showError('고객명은 2글자 이상 입력해주세요', validationError);
            return false;
        }
        
        // 연락처 검사 (한국 전화번호 패턴)
        const phonePattern = /^(01[016789]|02|0[3-9][0-9])-[0-9]{3,4}-[0-9]{4}$/;
        if (!customerPhone) {
            this.showError('연락처를 입력해주세요', validationError);
            return false;
        }
        
        if (!phonePattern.test(customerPhone)) {
            this.showError('연락처 형식이 올바르지 않습니다 (예: 010-1234-5678)', validationError);
            return false;
        }
        
        // 이메일 검사
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!customerEmail) {
            this.showError('이메일을 입력해주세요', validationError);
            return false;
        }
        
        if (!emailPattern.test(customerEmail)) {
            this.showError('올바른 이메일 형식을 입력해주세요', validationError);
            return false;
        }
        
        this.hideError(validationError);
        return true;
    }
    
    static showError(message, errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
    
    static hideError(errorElement) {
        errorElement.style.display = 'none';
    }
}

// 견적 테이블 관리 클래스
class QuoteTable {
    
    constructor(tableBodyId, totalAmountId) {
        this.tableBody = document.getElementById(tableBodyId);
        this.totalAmountElement = document.getElementById(totalAmountId);
        this.total = 0;
    }
    
    // 견적 항목 추가
    addItem(id, code, name, spec, price, quantity, productType = '') {
        const row = document.createElement('tr');
        const amount = price * quantity;
        
        row.innerHTML = `
            <td class="py-2">${name} ${id ? `<span class="text-gray-500">(${id})</span>` : ''}</td>
            <td class="py-2">${code}</td>
            <td class="py-2">${spec}</td>
            <td class="text-right py-2">${CommonUtils.formatCurrency(price)}원</td>
            <td class="text-right py-2">${quantity}</td>
            <td class="text-right py-2">${CommonUtils.formatCurrency(amount)}원</td>
        `;
        
        // 제품 타입을 data 속성으로 저장
        if (productType) {
            row.setAttribute('data-product-type', productType);
        }
        
        this.tableBody.appendChild(row);
        this.total += amount;
        this.updateTotal();
        
        return row;
    }
    
    // 테이블 초기화
    clear() {
        this.tableBody.innerHTML = '';
        this.total = 0;
        this.updateTotal();
    }
    
    // 총액 업데이트
    updateTotal() {
        this.totalAmountElement.textContent = CommonUtils.formatCurrency(this.total) + '원';
    }
    
    // 견적 데이터 수집
    collectQuoteData() {
        const items = [];
        const rows = this.tableBody.querySelectorAll('tr');
        
        rows.forEach(row => {
            const cells = row.cells;
            if (cells.length >= 6) {
                items.push({
                    name: cells[0].textContent.trim(),
                    code: cells[1].textContent.trim(),
                    spec: cells[2].textContent.trim(),
                    unitPrice: cells[3].textContent.replace(/[^\d]/g, ''),
                    quantity: cells[4].textContent.trim(),
                    amount: cells[5].textContent.replace(/[^\d]/g, ''),
                    productType: row.getAttribute('data-product-type') || ''
                });
            }
        });
        
        return items;
    }
}

// 이메일 발송 클래스
class EmailService {
    
    // 견적서 이메일 발송
    static async sendQuote(quoteData) {
        try {
            console.log('전송할 데이터:', quoteData);
            
            // URL 인코딩된 form 데이터로 전송
            const formBody = 'data=' + encodeURIComponent(JSON.stringify(quoteData));
            
            // no-cors 모드로 전송 (CORS 우회)
            await fetch(CONFIG.APPS_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formBody
            });
            
            console.log('이메일 발송 요청 완료');
            return true;
            
        } catch (error) {
            console.error('이메일 발송 오류:', error);
            throw error;
        }
    }
}

// 디버그 정보 표시 클래스
class DebugInfo {
    
    static show(data) {
        const debugInfo = document.getElementById('debugInfo');
        if (!debugInfo) return;
        
        const debugContent = `
            <h4>🐛 디버그 정보</h4>
            <p><strong>고객명:</strong> ${data.customerName}</p>
            <p><strong>이메일:</strong> ${data.email}</p>
            <p><strong>연락처:</strong> ${data.phone}</p>
            <p><strong>제품구분:</strong> ${data.productType || '미지정'}</p>
            <p><strong>총 견적금액:</strong> ${CommonUtils.formatCurrency(data.totalAmount)}원</p>
            <p><strong>견적 항목 수:</strong> ${data.items.length}개</p>
            <p><strong>전송 URL:</strong> ${CONFIG.APPS_SCRIPT_URL}</p>
            <p><strong>타임스탬프:</strong> ${new Date().toLocaleString()}</p>
            <details>
                <summary>상세 데이터</summary>
                <pre>${JSON.stringify(data, null, 2)}</pre>
            </details>
        `;
        
        debugInfo.innerHTML = debugContent;
        debugInfo.style.display = debugInfo.style.display === 'none' ? 'block' : 'none';
    }
}

// DOM이 로드된 후 공통 이벤트 리스너 설정
document.addEventListener('DOMContentLoaded', function() {
    
    // 유효기간 설정
    const expiryDateElement = document.getElementById('expiryDate');
    if (expiryDateElement) {
        expiryDateElement.textContent = CommonUtils.getExpiryDate();
    }
    
    // 연락처 자동 포맷팅
    const phoneInput = document.getElementById('customerPhone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            e.target.value = CommonUtils.formatPhoneNumber(e.target.value);
        });
    }
    
    // 디버그 버튼 이벤트
    const debugBtn = document.getElementById('debugBtn');
    if (debugBtn) {
        debugBtn.addEventListener('click', function() {
            // 각 제품별 파일에서 구현된 함수 호출
            if (typeof showDebugInfo === 'function') {
                showDebugInfo();
            }
        });
    }
    
    console.log('✅ 공통 스크립트 로드 완료');
});
