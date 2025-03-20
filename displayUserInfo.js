// Function to display user information
function displayUserInfo({ name = "Guest", age = 18, ...rest }) {
  // Destructuring with default parameters
  console.log(`Name: ${name}`);
  console.log(`Age: ${age}`);

  // Rest parameters: Collect remaining properties
  console.log("Additional Info:", rest);
}

// Example User Object
const user = {
  name: "Alice",
  age: 25,
  country: "USA",
  occupation: "Engineer"
};

// Spread Operator: Expand the user object
const updatedUser = {
  ...user, // Spread operator: Expands the `user` object
  age: 26 // Override the `age` property
};

// Call the function
displayUserInfo(updatedUser);
