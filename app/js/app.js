(function () {
	'use strict';
	var ENTER_KEY = 13;
	var ESCAPE_KEY = 27;
	var util = {
		uuid: function () {
			var i, random;
			var uuid = '';
			for (i = 0; i < 32; i++) {
				random = Math.random() * 16 | 0;
				if (i === 8 || i === 12 || i === 16 || i === 20) {
					uuid += '-';
				}
				uuid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random)).toString(16);
			}

			return uuid;
		},
		store: function (namespace, data) {
			if (arguments.length > 1) {
				return localStorage.setItem(namespace, JSON.stringify(data));
			} else {
				var store = localStorage.getItem(namespace);
				return (store && JSON.parse(store)) || [];
			}
		},
		createTodoElement: function (todo) {
  			var container = document.createElement('div')
  			container.innerHTML = '<li '+(todo.completed ? 'class="completed"' : '')+' \
			data-id="'+todo.id + '"><div class="view">\
					<input class="toggle" type="checkbox"\
					'+(todo.completed ? ' checked' : '')+'/>\
					<label>'+todo.title+'</label>\
					<button class="destroy"></button>\
				</div>\
				<input class="edit" value="' + todo.title + '">\
			</li>';
			return container.firstChild;
		}
	};

	var App = {
		init: function () {
			this.todos = util.store('my-todos');
			this.bindEvents();
			this.render();
		},
		bindEvents: function () {
			document.getElementById('new-todo').addEventListener('keyup', this.create.bind(this));
			document.getElementById('toggle-all').addEventListener('change', this.toggleAll.bind(this));
			document.getElementById('clear-completed').addEventListener('click', this.destroyCompleted.bind(this));
			document.getElementById('filters').addEventListener('click', this.changeFilter.bind(this));
			var todoList = document.getElementById('todo-list');
			todoList.addEventListener('change', this.toggle.bind(this));
			todoList.addEventListener('dblclick', this.edit.bind(this));
			todoList.addEventListener('keyup', this.editKeyup.bind(this));
			todoList.addEventListener('click', this.destroy.bind(this));
		},
		render: function () {
			var todos = this.getFilteredTodos();
			var todo_container = document.getElementById('todo-list');
			var z = this;
			todo_container.innerHTML='';
			todos.forEach(function (todo) {
				var el_todo = util.createTodoElement(todo);
				el_todo.getElementsByClassName('edit')[0].addEventListener('blur', z.update.bind(z));
				todo_container.appendChild(el_todo);
			});
			document.getElementById('main').style.display = this.todos.length > 0 ? 'block' : 'none';
			document.getElementById('footer').style.display = this.todos.length > 0 ? 'block' : 'none';
			document.getElementById('toggle-all').checked = this.getActiveTodos().length === 0;
			document.getElementById('new-todo').focus();
			this.renderFooter();
			util.store('my-todos', this.todos);
		},
		renderFooter: function () {
			var todoCount = this.todos.length;
			var activeTodoCount = this.getActiveTodos().length;
			var container = document.getElementById('todo-count');
			container.innerHTML='<strong>'+activeTodoCount+'</strong> \
				'+(activeTodoCount===1 ?'item':'items')+' left';
		},
		getActiveTodos: function () {
			return this.todos.filter(todo => !todo.completed);
		},
		getCompletedTodos: function () {
			return this.todos.filter(todo => todo.completed);
		},
		getFilteredTodos: function () {
			if (this.filter === 'Active') {
				return this.getActiveTodos();
			}
			if (this.filter === 'Completed') {
				return this.getCompletedTodos();
			}
			return this.todos;
		},
		toggleAll: function (e) {
			var isChecked = e.target.checked;
			this.todos.forEach(todo => todo.completed = isChecked);
			this.render();
		},
		destroyCompleted: function () {
			this.todos = this.getActiveTodos();
			this.filter = 'All';
			this.render();
		},
		indexFromEl: function (el,parent) {
			var id = parent.dataset.id;
			var todos = this.todos;
			var i = todos.length;
			while (i--) {
				if (todos[i].id === id) {
					return i;
				}
			}
		},
		create: function (e) {
			var input = e.target;
			var val = input.value.trim();
			if (e.which !== ENTER_KEY || !val) {
				return;
			}
			this.todos.push({
				id: util.uuid(),
				title: val,
				completed: false
			});
			input.value = '';
			this.render();
		},
		toggle: function (e) {
			if(e.target.className==='toggle') {
				var parent = e.target.parentNode.parentNode;
				var i = this.indexFromEl(e.target,parent);
				this.todos[i].completed = !this.todos[i].completed;
				this.render();
			}
		},
		edit: function (e) {
			var el = e.target.parentNode.parentNode;
			var input = el.getElementsByClassName('edit')[0];
			el.classList.add('editing');
			input.focus();
		},
		changeFilter: function (e) {
			var el = e.target;
			var selected = e.currentTarget.getElementsByClassName('selected')[0];
			selected.classList.remove('selected');
			el.classList.add('selected');
			this.filter = el.innerText;
			this.render();
		},
		editKeyup: function (e) {
			if (e.which === ENTER_KEY) {
				e.target.blur();
			}
			if (e.which === ESCAPE_KEY) {
				e.target.dataset.abort = true;
				e.target.blur();
			}
		},
		update: function (e) {
			var el = e.target;
			var value = el.value.trim();
			if (!value) {
				this.todos.splice(this.indexFromEl(e.target, e.target.parentNode), 1);
				this.render();
				return;
			}
			if (el.dataset.abort) {
				el.dataset.abort = false;
			} else {
				this.todos[this.indexFromEl(el,e.target.parentNode)].title = value;
			}
			this.render();
		},
		destroy: function (e) {
			if(e.target.className==='destroy') {
				var parent = e.target.parentNode.parentNode;
				this.todos.splice(this.indexFromEl(e.target, parent), 1);
				this.render();
			}
		}
	};
	App.init();
})();
