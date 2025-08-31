
const MENU_URL = 'https://raw.githubusercontent.com/saksham-accio/f2_contest_3/main/food.json';

// DOM refs
const menuGrid = document.getElementById('menuGrid');
const menuFlowStatus = document.getElementById('menuFlowStatus');
const startOrderBtn = document.getElementById('startOrder');
const searchInput = document.getElementById('search');

// Utility: add a status step
function addStep(whereId, text, ok = null){
  const host = document.getElementById(whereId);
  const div = document.createElement('div');
  div.className = 'step' + (ok === true ? ' ok' : ok === false ? ' fail' : '');
  div.textContent = text;
  host.appendChild(div);
  // keep last 8
  const steps = host.querySelectorAll('.step');
  if(steps.length > 8) host.removeChild(host.firstChild);
}

// 1. getMenu()
async function getMenu(){
  if(menuGrid.children.length) return;
  try{
    const res = await fetch(MENU_URL);
    if(!res.ok) throw new Error('Fetch failed');
    const items = await res.json();
    renderMenu(items);
  }catch(err){
    alert('Could not load menu: ' + err.message);
  }
}

function renderMenu(items){
  debugger
  menuGrid.innerHTML = '';
  items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="img-wrap"><img loading="lazy" src="${item.imgSrc}" alt="${item.name}"></div>
      <div class="body">
        <div class="left">
          <div class="title">${item.name}</div>
          <div class="price">$${Number(item.price).toFixed(2)}/-</div>
        </div>
        <button class="plus-btn" title="Add">+</button>
      </div>`;
    // image fallback
    const img = card.querySelector('img');
    img.addEventListener('error', () => img.src = `https://picsum.photos/seed/${item.id}/600/400?food`);

    menuGrid.appendChild(card);
  });
}

// 2. TakeOrder
function TakeOrder(menuItems){
  return new Promise(resolve => {
    setTimeout(() => {
      const burgers = menuItems.filter(i => /burger/i.test(i.name.toLowerCase()));
      const pool = burgers.length >= 3 ? burgers : menuItems;
      const pick = [];
      while(pick.length < 3){
        const r = pool[Math.floor(Math.random()*pool.length)];
        if(!pick.includes(r)) pick.push(r);
      }
      resolve({items: pick});
    }, 2500);
  });
}

// 3. orderPrep
function orderPrep(order){
  return new Promise(resolve => {
    setTimeout(() => resolve({...order, order_status:true, paid:false}), 1500);
  });
}

// 4. payOrder
function payOrder(order){
  return new Promise(resolve => {
    setTimeout(() => resolve({...order, paid:true}), 1000);
  });
}

// 5. thankyouFnc
function thankyouFnc(){
  alert('thankyou for eating with us today!');
}


async function runOrderFlow(){
  menuFlowStatus.innerHTML = '';
  try{
    addStep('menuFlowStatus', 'Fetching menu ...');
    const res = await fetch(MENU_URL);
    if(!res.ok) throw new Error('Fetch failed');
    const menuItems = await res.json();
    addStep('menuFlowStatus', 'Menu fetched. Taking order ...', true);

    const order = await TakeOrder(menuItems);
    addStep('menuFlowStatus', `Selected 3 items: ${order.items.map(i=>i.name).join(', ')}`, true);

    const prepped = await orderPrep(order);
    addStep('menuFlowStatus', 'Order prepared.', true);

    const paid = await payOrder(prepped);
    addStep('menuFlowStatus', 'Payment successful.', true);

    if(paid.paid === true){
      addStep('menuFlowStatus', 'All done. Showing thank you...', true);
      thankyouFnc();
    }
  }catch(err){
    addStep('menuFlowStatus', 'Error: ' + err.message, false);
  }
}


startOrderBtn.addEventListener('click', runOrderFlow);
document.addEventListener('DOMContentLoaded', getMenu);

searchInput.addEventListener('input', (e) => {
  const q = e.target.value.trim().toLowerCase();
  const cards = Array.from(menuGrid.querySelectorAll('.card'));
  if(!q){ cards.forEach(c=> c.style.display=''); return; }
  cards.forEach(c => {
    const title = c.querySelector('.title').textContent.toLowerCase();
    c.style.display = title.includes(q) ? '' : 'none';
  });
});
