// Simple shopping cart using localStorage
const CART_KEY = 'zipkeys_cart_v1';

function getCart() {
	try {
		const raw = localStorage.getItem(CART_KEY);
		return raw ? JSON.parse(raw) : [];
	} catch (e) {
		console.error('Failed to parse cart from localStorage', e);
		return [];
	}
}

function saveCart(cart) {
	localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function addItem(item) {
	const cart = getCart();
	const existing = cart.find(i => i.name === item.name);
	if (existing) {
		existing.qty += item.qty || 1;
	} else {
		cart.push({ ...item, qty: item.qty || 1 });
	}
	saveCart(cart);
	return cart;
}

function removeItem(name) {
	let cart = getCart();
	cart = cart.filter(i => i.name !== name);
	saveCart(cart);
	return cart;
}

function updateQuantity(name, qty) {
	const cart = getCart();
	const it = cart.find(i => i.name === name);
	if (it) {
		it.qty = Math.max(0, Number(qty) || 0);
		if (it.qty === 0) {
			return removeItem(name);
		}
		saveCart(cart);
	}
	return cart;
}

function getTotal(cart) {
	return cart.reduce((s, i) => s + (Number(i.price) || 0) * (Number(i.qty) || 0), 0);
}

function formatRupiah(num) {
	return 'Rp. ' + Number(num).toLocaleString('id-ID');
}

// Render cart UI when on cart page
function renderCart() {
	const cart = getCart();
	const itemsTbody = document.getElementById('cart-items');
	const totalEl = document.getElementById('cart-total');
	const emptyEl = document.getElementById('cart-empty');
	const cartArea = document.getElementById('cart-area');

	if (!itemsTbody || !totalEl) return; // not on cart page

	if (cart.length === 0) {
		itemsTbody.innerHTML = '';
		totalEl.textContent = formatRupiah(0);
		emptyEl.style.display = '';
		cartArea.style.display = 'none';
		return;
	}

	emptyEl.style.display = 'none';
	cartArea.style.display = '';
	itemsTbody.innerHTML = '';

	cart.forEach(item => {
		const tr = document.createElement('tr');

		const tdProd = document.createElement('td');
		tdProd.innerHTML = `<div class="d-flex align-items-center"><img src="${item.image}" alt="" width="64" class="me-2"/><div><strong>${item.name}</strong></div></div>`;

		const tdPrice = document.createElement('td');
		tdPrice.textContent = formatRupiah(item.price);

		const tdQty = document.createElement('td');
		const qtyInput = document.createElement('input');
		qtyInput.type = 'number';
		qtyInput.min = '0';
		qtyInput.value = item.qty;
		qtyInput.style.width = '80px';
		qtyInput.className = 'form-control';
		qtyInput.addEventListener('change', (e) => {
			updateQuantity(item.name, e.target.value);
			renderCart();
		});
		tdQty.appendChild(qtyInput);

		const tdSub = document.createElement('td');
		tdSub.textContent = formatRupiah((item.price) * item.qty);

		const tdRem = document.createElement('td');
		const removeBtn = document.createElement('button');
		removeBtn.className = 'btn btn-sm btn-outline-danger';
		removeBtn.textContent = 'Remove';
		removeBtn.addEventListener('click', () => {
			removeItem(item.name);
			renderCart();
		});
		tdRem.appendChild(removeBtn);

		tr.appendChild(tdProd);
		tr.appendChild(tdPrice);
		tr.appendChild(tdQty);
		tr.appendChild(tdSub);
		tr.appendChild(tdRem);

		itemsTbody.appendChild(tr);
	});

	totalEl.textContent = formatRupiah(getTotal(cart));
}

// Attach add-to-cart listeners on shopping page
function attachAddToCartButtons() {
	const buttons = document.querySelectorAll('.add-to-cart');
	buttons.forEach(btn => {
		btn.addEventListener('click', (e) => {
			const name = btn.getAttribute('data-name');
			const price = Number(btn.getAttribute('data-price')) || 0;
			const image = btn.getAttribute('data-image') || '';
			addItem({ name, price, image, qty: 1 });
			// provide quick feedback
			btn.textContent = 'Added';
			setTimeout(() => btn.textContent = 'Add To Cart', 1000);
		});
	});
}

// Clear cart
function clearCart() {
	localStorage.removeItem(CART_KEY);
	renderCart();
}

// Simple checkout stub
function checkout() {
	const cart = getCart();
	if (cart.length === 0) {
		alert('Cart is empty');
		return;
	}
	alert('Thank You for the buy! Total: ' + formatRupiah(getTotal(cart)));
}

// Init on DOM ready
document.addEventListener('DOMContentLoaded', () => {
	attachAddToCartButtons();
	renderCart();

	const clearBtn = document.getElementById('clear-cart');
	if (clearBtn) clearBtn.addEventListener('click', () => { clearCart(); });

	const checkoutBtn = document.getElementById('checkout');
	if (checkoutBtn) checkoutBtn.addEventListener('click', () => { checkout(); });
});
