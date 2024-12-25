import React from "react";
import CodeRunner from "../components/CodeRunner";

const Learn: React.FC = () => {
  return (
    <div className="learn-page">
      <h1>Learn JavaScript</h1>

      <section className="lesson">
        <h2>Variables and Data Types</h2>
        <p>Try declaring variables and using different data types:</p>
        <CodeRunner
          initialCode={`// Declare a variable
let message = "Hello, World!";
console.log(message);

// Try different data types
let number = 42;
let isTrue = true;
let array = [1, 2, 3];

console.log(typeof message);
console.log(typeof number);
console.log(typeof isTrue);
console.log(Array.isArray(array));`}
        />
      </section>
    </div>
  );
};

export default Learn;
