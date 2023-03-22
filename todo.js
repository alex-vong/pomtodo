const itemForm = document.getElementById('item-form'),
  addItemBtn = itemForm.querySelector('button'),
  itemInput = document.getElementById('item-input'),
  itemList = document.getElementById('item-list'),
  clearList = document.getElementById('clear'),
  tlStatus = document.querySelector('.tl-status'),
  itemFilter = document.getElementById('filter'),
  allBtn = document.getElementById('all'),
  pendingBtn = document.getElementById('pending'),
  completeBtn = document.getElementById('completed'),
  existMsg = document.createElement('p');

let isEditMode = false;
let editedTask;

let state = '';

// gets items form ls and appends to dom
function displayItems(object) {
  if (state === 'pending' || state === 'complete') {
    itemList.innerHTML = '';
    object.forEach((task) => {
      createItem(task.taskName, task);
    });
  } else {
    const itemsFromStorage = getItemsFromStorage();
    itemList.innerHTML = '';

    itemsFromStorage.forEach((item) => {
      createItem(item.taskName, item);
    });
  }
}

function addItem(e) {
  e.preventDefault();

  let newTodo = itemInput.value.trim();

  if (isEditMode) {
    const originalTodo = editedTask.textContent;

    if (!checkIfTaskExist(newTodo) && newTodo.length > 0) {
      updateStorage(originalTodo, newTodo);
      //   resetEdit();
      return;
    } else {
      generateAllReadyExistMsg(newTodo);
      return;
    }
  }

  if (newTodo.length > 0) {
    let check = checkIfTaskExist(newTodo);
    if (check === false) {
      addItemToStorage(newTodo);
      createItem(newTodo);
    } else {
      generateAllReadyExistMsg(newTodo);

      return;
    }
  }
}

//takes in the new todo and creates a new todo item input
function createItem(newTodo, item) {
  isEditMode = false;
  const li = document.createElement('li');
  li.className = `flex tl__list-item`;

  const todo = document.createElement('p');

  if (item && item.status === 'complete') {
    todo.className = `primary-text completed`;
  } else {
    todo.className = `primary-text`;
  }
  //   todo.className = `primary-text`;

  todo.textContent = newTodo;

  const actionMenu = makeActionMenu();
  li.append(todo, actionMenu);

  itemList.appendChild(li);
  checkUl();

  itemInput.value = ''; //clears text input field after submit
  toggleTask();
}

// creates check, edit, delete icons menu bar
function makeActionMenu() {
  const settings = document.createElement('div');
  settings.className = 'list-item-settings flex';

  const actionBtns = makeActionButtons([
    'complete-item',
    'edit-item',
    'delete-item',
  ]);

  actionBtns.forEach((btn) => {
    settings.appendChild(btn);
  });

  return settings;
}

//takes in array of font-awesome class names and creates new buttons for each class name
function makeActionButtons(classes) {
  const buttonsArray = [];

  classes.forEach((className, index) => {
    const button = document.createElement('button');
    button.classList.add(className);

    if (index === 0) {
      button.innerHTML = `<i class="fa-regular fa-circle-check" ></i>`;
    }
    if (index === 1) {
      button.innerHTML = `<i class="fa-regular fa-pen-to-square" ></i>`;
    }
    if (index === 2) {
      button.innerHTML = `<i class="fa-regular fa-trash-can" ></i>`;
    }

    buttonsArray.push(button);
  });

  return buttonsArray;
}

// add items to local storage
function addItemToStorage(item) {
  isEditMode = false;
  const itemsInStorage = getItemsFromStorage();

  let itemInfo = { taskName: item, status: 'pending' };
  itemsInStorage.push(itemInfo);

  //covert to json string and set to local storage
  localStorage.setItem('items', JSON.stringify(itemsInStorage));
}

function getItemsFromStorage() {
  let itemsInStorage;

  if (localStorage.getItem('items') === null) {
    itemsInStorage = [];
  } else {
    itemsInStorage = JSON.parse(localStorage.getItem('items'));
  }
  return itemsInStorage;
}

function updateStorage(ogInput, newInput) {
  const itemsInStorage = getItemsFromStorage();

  itemsInStorage.forEach((item) => {
    if (item.taskName === ogInput) {
      item.taskName = newInput;
    }
  });

  const updatedObjString = JSON.stringify(itemsInStorage);

  // Store the updated string in local storage
  localStorage.setItem('items', updatedObjString);

  //   checkUl();
  displayItems();
}

function onClickItem(e) {
  e.stopPropagation();
  if (e.target.parentElement.classList.contains('delete-item')) {
    const li = e.target.parentElement.parentElement.parentElement;
    const i = e.target;
    removeItem(li, i);
  } else if (e.target.parentElement.classList.contains('edit-item')) {
    setItemToEdit(e.target);
  } else if (e.target.parentElement.classList.contains('complete-item')) {
    setItemToComplete(e.target);
  }
}

function checkIfTaskExist(item) {
  const itemsFromStorage = getItemsFromStorage();

  const hasItem = itemsFromStorage.some((list) => list.taskName === item);
  return hasItem;
}

function setItemToEdit(item) {
  isEditMode = true;
  removeEditTextActive();
  removeEditIconActive();
  item.classList.add('edit--active');
  const editCurrentText =
    item.parentElement.parentElement.parentElement.firstChild;
  editCurrentText.parentElement.classList.add('edit__text--active');
  editedTask = editCurrentText;
  addItemBtn.innerHTML = `<i class="fa-regular fa-pen-to-square"></i> Edit Task`;
  addItemBtn.classList.add('edit-btn--active');
  itemInput.value = editCurrentText.textContent;
  itemInput.focus();
}

function setItemToComplete(item) {
  const task = item.parentElement.parentElement.parentElement.firstChild;
  updateStatusOnStorage(task);
  toggleTask();
}

function updateStatusOnStorage(task) {
  const itemsInStorage = getItemsFromStorage();
  itemsInStorage.forEach((item) => {
    if (item.taskName === task.textContent) {
      if (item.status === 'pending') {
        item.status = 'complete';
        task.classList.add('completed');
      } else {
        item.status = 'pending';
        task.classList.remove('completed');
      }
    }
  });

  const updatedObjString = JSON.stringify(itemsInStorage);

  // Store the updated string in local storage
  localStorage.setItem('items', updatedObjString);
}

function toggleTask() {
  const allCompletedTask = document.querySelectorAll('.tl__list-item');
  allCompletedTask.forEach((task) => {
    if (task.firstChild.classList.contains('completed')) {
      task.firstChild.classList.add('list-item--checked-off');
      task.children[1].firstChild.firstChild.classList.add('icon--checked-off');
    } else {
      task.firstChild.classList.remove('list-item--checked-off');
      task.children[1].firstChild.firstChild.classList.remove(
        'icon--checked-off'
      );
    }
  });
}

function removeEditTextActive() {
  const allLis = itemList.querySelectorAll('li');
  allLis.forEach((li) => li.classList.remove('edit__text--active'));
}

function removeEditIconActive() {
  const allEditIcons = document.querySelectorAll('i.fa-pen-to-square');
  allEditIcons.forEach((i) => i.classList.remove('edit--active'));
}

function removeItem(item, icon) {
  icon.classList.add('deleted-item');

  setTimeout(function () {
    item.remove();

    removeItemFromStorage(item.textContent);
    checkUl();
  }, 400);
}

function removeItemFromStorage(item) {
  const itemsFromStorage = getItemsFromStorage();
  //   console.log(itemsFromStorage);

  // filter out item to be removed
  let filterItem = itemsFromStorage.filter((i) => i.taskName !== item);

  //re-set to local storage
  localStorage.setItem('items', JSON.stringify(filterItem));
}

function clearUL() {
  const allLis = itemList.querySelectorAll('.delete-item i');

  allLis.forEach((li) => {
    li.classList.add('deleted-item');
  });
  setTimeout(function () {
    itemList.innerHTML = '';
    localStorage.removeItem('items');
    checkUl();
  }, 500);
}

function checkUl() {
  const items = itemList.querySelectorAll('li');
  if (items.length === 0) {
    itemFilter.classList.add('hidden');
    clearList.classList.add('hidden');
    tlStatus.classList.add('hidden');
    createNoTaskCard();
  } else {
    itemFilter.classList.remove('hidden');
    clearList.classList.remove('hidden');
    tlStatus.classList.remove('hidden');
    hideNoTaskCard();
  }
}

function filterItem(e) {
  const items = itemList.querySelectorAll('li');

  const input = e.target.value.toLowerCase();

  items.forEach((li) => {
    const itemName = li.firstChild.parentElement.innerText.toLowerCase();
    if (itemName.indexOf(input) !== -1) {
      if (li.classList.contains('hidden')) {
        li.classList.remove('hidden');
      }
    } else {
      li.classList.add('hidden');
    }
  });

  changeFilterState(input);
}

function changeFilterState(input) {
  console.log(input);

  if (input.length > 0) {
    itemFilter.style.background = 'var(--white)';
    itemFilter.style.color = 'var(--black)';
  } else {
    itemFilter.style.background = 'var(--card-bg)';
    itemFilter.style.color = 'var(--white)';
  }
}

function createNoTaskCard() {
  const tlStatus = document.querySelector('.tl-status');
  const noTaskHeading = document.createElement('div');
  noTaskHeading.className = 'primary-text no-task-alert';
  noTaskHeading.textContent =
    'There are no task. Add a new task to begin your day!';

  noTaskHeading.style.textAlign = 'center';

  tlStatus.insertAdjacentElement('afterend', noTaskHeading);
}

function generateAllReadyExistMsg(todo) {
  existMsg.className = 'primary-text already-exist';
  existMsg.textContent = `"${todo}" already exist!`;

  itemForm.insertAdjacentElement('afterend', existMsg);
}

function hideNoTaskCard() {
  const noTask = document.querySelector('.no-task-alert');
  if (noTask) {
    noTask.remove();
  }
}

function resetEdit() {
  removeEditTextActive();
  removeEditIconActive();
  addItemBtn.innerHTML = `<i class="fa-solid fa-plus"></i> Add Task`;
  addItemBtn.classList.remove('edit-btn--active');

  existMsg.classList.add('hidden');
  //   itemForm.reset();
}

function displayAll() {
  state = 'all';
  const itemsFromStorage = getItemsFromStorage();
  allBtn.classList.add('tl-status-active');
  completeBtn.classList.remove('tl-status-active');
  pendingBtn.classList.remove('tl-status-active');
  displayItems();
}

function displayPending() {
  state = 'pending';
  const itemsFromStorage = getItemsFromStorage();
  let pendingTask = [];

  itemsFromStorage.forEach((task) => {
    if (task.status === 'pending') {
      pendingTask.push(task);
    }
  });

  allBtn.classList.remove('tl-status-active');
  completeBtn.classList.remove('tl-status-active');
  pendingBtn.classList.add('tl-status-active');

  displayItems(pendingTask);
}

function displayCompleted() {
  state = 'complete';
  const itemsFromStorage = getItemsFromStorage();
  let pendingTask = [];

  itemsFromStorage.forEach((task) => {
    if (task.status === 'complete') {
      pendingTask.push(task);
    }
  });

  allBtn.classList.remove('tl-status-active');
  completeBtn.classList.add('tl-status-active');
  pendingBtn.classList.remove('tl-status-active');

  displayItems(pendingTask);
}

function init() {
  //   Event Listeners
  itemForm.addEventListener('submit', addItem);

  itemList.addEventListener('click', onClickItem);
  clearList.addEventListener('click', clearUL);
  itemFilter.addEventListener('input', filterItem);
  //   itemFilter.addEventListener('click', changeFilterState);
  document.addEventListener('DOMContentLoaded', displayItems);
  document.addEventListener('click', resetEdit);
  allBtn.addEventListener('click', displayAll);
  pendingBtn.addEventListener('click', displayPending);
  completeBtn.addEventListener('click', displayCompleted);

  checkUl();
}

init();
