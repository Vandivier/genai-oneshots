const flashcards = [
  {
    category: "HTML",
    question: "What is the DOM?",
    answer:
      "The Document Object Model (DOM) is a programming interface for HTML documents. It represents the page as a tree-like structure where each node is an object representing part of the document, allowing programs to change the document structure, style, and content.",
  },
  {
    category: "CSS",
    question: "What are the three main types of CSS selectors?",
    answer:
      "1. Element selectors (e.g., p, div)\n2. Class selectors (e.g., .className)\n3. ID selectors (e.g., #uniqueId)",
  },
  {
    category: "HTML",
    question: "What is Semantic HTML?",
    answer:
      "Semantic HTML uses tags that convey meaning about their content, rather than just presentation. Examples include <nav>, <header>, <article>, <section>, and <footer>. This improves accessibility, SEO, and code readability.",
  },
  {
    category: "HTML",
    question: "What is the purpose of the <body> tag?",
    answer:
      "The <body> tag defines the document's body and contains all the visible content of a webpage, including text, images, links, and other elements. Everything that you want users to see must be placed within the body tags.",
  },
  {
    category: "React",
    question: "What is a React Fragment and when should you use it?",
    answer:
      "A React Fragment (<> </> or <Fragment>) is a way to group multiple elements without adding an extra DOM node. Use it when you need to return multiple elements from a component but don't want to add an unnecessary div wrapper.",
  },
  {
    category: "React",
    question: "How do you handle click events in React?",
    answer:
      "Use the onClick prop with a function: \n<button onClick={() => handleClick()}>Click me</button>\n\nOr with a named function:\n<button onClick={handleClick}>Click me</button>",
  },
  {
    category: "JavaScript",
    question: "What is the difference between let, const, and var?",
    answer:
      "let: block-scoped, can be reassigned\nconst: block-scoped, cannot be reassigned\nvar: function-scoped, can be reassigned, hoisted",
  },
  {
    category: "React",
    question: "What is the purpose of useState in React?",
    answer:
      "useState is a React Hook that allows functional components to manage state. It returns an array with the current state value and a function to update it: const [count, setCount] = useState(0)",
  },
  {
    category: "CSS",
    question: "What is the CSS Box Model?",
    answer:
      "The CSS Box Model consists of:\n1. Content\n2. Padding\n3. Border\n4. Margin\nThese layers determine how much space an element takes up and its relationship to other elements.",
  },
  {
    category: "JavaScript",
    question: "What is the difference between map() and forEach()?",
    answer:
      "map() creates a new array with the results of calling a function for every array element.\nforEach() executes a function on each array element but doesn't return anything.",
  },
  {
    category: "React",
    question: "What are React props?",
    answer:
      "Props (properties) are read-only components that are passed from parent to child components. They help make components reusable by allowing them to receive data as parameters.",
  },
  {
    category: "HTML",
    question: "What is the purpose of the alt attribute in <img> tags?",
    answer:
      "The alt attribute provides alternative text for an image if it cannot be displayed or for accessibility purposes. Screen readers use this text to describe the image to visually impaired users.",
  },
  {
    category: "CSS",
    question: "What is CSS Flexbox?",
    answer:
      "Flexbox is a CSS layout model that allows responsive elements within a container to be automatically arranged depending on screen size. It provides an efficient way to layout, align, and distribute space among items.",
  },
  {
    category: "JavaScript",
    question: "What is the difference between == and ===?",
    answer:
      "== performs type coercion before comparison (loose equality)\n=== compares both value and type without coercion (strict equality)\nExample: 5 == '5' is true, but 5 === '5' is false",
  },
  {
    category: "React",
    question: "What is the purpose of useEffect?",
    answer:
      "useEffect is a React Hook that handles side effects in functional components. It runs after every render and can be used for data fetching, subscriptions, or manually changing the DOM.",
  },
  {
    category: "HTML",
    question: "What is the difference between <div> and <span>?",
    answer:
      "<div> is a block-level element that starts on a new line and takes up the full width available.\n<span> is an inline element that only takes up as much width as necessary.",
  },
  {
    category: "CSS",
    question: "What is CSS Grid?",
    answer:
      "CSS Grid is a two-dimensional layout system that can handle both columns and rows. It's ideal for creating complex layouts and can be used to create responsive designs without media queries.",
  },
  {
    category: "JavaScript",
    question: "What is event bubbling?",
    answer:
      "Event bubbling is when an event triggered on a nested element 'bubbles up' through its parent elements in the DOM tree. The event is first handled by the innermost element and then propagated to outer elements.",
  },
  {
    category: "React",
    question: "What is the Virtual DOM?",
    answer:
      "The Virtual DOM is a lightweight copy of the actual DOM in memory. React uses it to improve performance by first making changes to this virtual copy, then comparing it with the real DOM and updating only what's necessary.",
  },
  {
    category: "JavaScript",
    question: "What is a Promise in JavaScript?",
    answer:
      "A Promise is an object representing the eventual completion (or failure) of an asynchronous operation. It can be in one of three states: pending, fulfilled, or rejected. Used for handling async operations like API calls.",
  },
];

async function seedFlashcards(db) {
  // Clear existing flashcards
  await db.run("DELETE FROM flashcards");

  // Insert new flashcards
  const stmt = await db.prepare(
    "INSERT INTO flashcards (category, question, answer) VALUES (?, ?, ?)"
  );

  for (const card of flashcards) {
    await stmt.run([card.category, card.question, card.answer]);
  }

  await stmt.finalize();
}

module.exports = seedFlashcards;
