import { Elysia, t } from 'elysia';
import { html } from '@elysiajs/html';
import * as elements from 'typed-html';
let lastId = 2;
const app = new Elysia()
	.use(html())
	.get('/', ({ html }) =>
		html(
			<BaseHtml>
				<body
					class='w-full h-screen flex items-center justify-center'
					hx-get='/todos'
					hx-trigger='load'
					hx-swap='innerHTML'
				></body>
			</BaseHtml>
		)
	)

	.post(
		'/todos/toggle/:id',
		({ params }) => {
			const todo = db.find((todo) => todo.id === params.id);
			if (todo) {
				todo.completed = !todo.completed;
				return <TodoItem {...todo} />;
			}
		},
		{
			params: t.Object({
				id: t.Numeric(),
			}),
		}
	)
	.post(
		'/todos',
		({ body }) => {
			if (body.content.length === 0) {
				throw new Error('content cannot be empty');
			}
			const newTodo = {
				id: lastId++,
				content: body.content,
				completed: false,
			};
			db.push(newTodo);
			return <TodoItem {...newTodo} />;
		},
		{
			body: t.Object({
				content: t.String(),
			}),
		}
	)
	.delete(
		'/todos/:id',
		({ params }) => {
			const todo = db.find((todo) => todo.id === params.id);
			if (todo) {
				db.splice(db.indexOf(todo), 1);
			}
		},
		{
			params: t.Object({
				id: t.Numeric(),
			}),
		}
	)
	.get('/todos', () => <TodoList todos={db} />)
	.listen(3000);
console.log(`Elysia running at ${app.server?.hostname}:${app.server?.port}`);

const BaseHtml = ({ children }: elements.Children) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BETH STACK TEST</title>
    <script src="https://unpkg.com/htmx.org@1.9.6" integrity="sha384-FhXw7b6AlE/jyjlZH5iHa/tTe9EpJ1Y55RjcgPbjeWMskSxZt1v9qkxLJWNJaGni" crossorigin="anonymous"></script>
  <script src="https://cdn.tailwindcss.com"></script>

</head>
${children}
`;
type Todo = {
	id: number;
	content: string;
	completed: boolean;
};

const db: Todo[] = [
	{ id: 1, content: 'fix the error in html', completed: false },
	{ id: 2, content: 'give up', completed: true },
];

function TodoItem({ id, content, completed }: Todo) {
	return (
		<div class='flex flex-row space-x-3'>
			<p>{content}</p>
			<input
				type='checkbox'
				checked={completed}
				hx-post={`/todos/toggle/${id}`}
				hx-target='closest div'
				hx-swap='outerHTML'
			/>
			<button
				class='text-red-300'
				hx-delete={`/todos/${id}`}
				hx-swap='outerHTML'
				hx-target='closest div'
			>
				X
			</button>
		</div>
	);
}

function TodoList({ todos }: { todos: Todo[] }) {
	return (
		<div>
			{todos.map((todo) => (
				<TodoItem {...todo} />
			))}
			<TodoForm />
		</div>
	);
}

function TodoForm() {
	return (
		<form
			class='flex flex-row space-x-3'
			hx-post='/todos'
			hx-swap='beforebegin'
		>
			<input type='text' class='border border-black' name='content' />
			<button type='submit'>Add</button>
		</form>
	);
}
