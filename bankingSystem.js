// Parent Class: BankAccount
class BankAccount {
  constructor(owner, balance) {
    this.owner = owner;
    this._balance = balance; // Encapsulation: Use underscore for "private" property
  }

  // Encapsulation: Getter for balance
  get balance() {
    return this._balance;
  }

  // Encapsulation: Setter for balance
  set balance(amount) {
    if (amount < 0) {
      console.log("Balance cannot be negative.");
      return;
    }
    this._balance = amount;
  }

  // Abstraction: Hide implementation details
  deposit(amount) {
    if (amount > 0) {
      this._balance += amount;
      console.log(`Deposited ${amount}. New balance: ${this._balance}`);
    } else {
      console.log("Invalid deposit amount.");
    }
  }

  // Abstraction: Hide implementation details
  withdraw(amount) {
    if (amount > 0 && amount <= this._balance) {
      this._balance -= amount;
      console.log(`Withdrew ${amount}. New balance: ${this._balance}`);
    } else {
      console.log("Invalid withdrawal amount.");
    }
  }
}

// Child Class: SavingsAccount (Inheritance)
class SavingsAccount extends BankAccount {
  constructor(owner, balance, interestRate) {
    super(owner, balance); // Inheritance: Call parent constructor
    this.interestRate = interestRate;
  }

  // Polymorphism: Override the withdraw method
  withdraw(amount) {
    if (amount > 1000) {
      console.log("Withdrawal limit exceeded. Max withdrawal: 1000.");
    } else {
      super.withdraw(amount); // Call the parent class's withdraw method
    }
  }

  // Additional method for SavingsAccount
  addInterest() {
    const interest = this._balance * (this.interestRate / 100);
    this._balance += interest;
    console.log(`Added interest: ${interest}. New balance: ${this._balance}`);
  }
}

// Example Usage
const savingsAccount = new SavingsAccount("Bob", 2000, 5);

console.log(savingsAccount.balance); // Getter: Outputs 2000
savingsAccount.deposit(500); // Outputs: Deposited 500. New balance: 2500
savingsAccount.withdraw(1200); // Outputs: Withdrawal limit exceeded. Max withdrawal: 1000.
savingsAccount.withdraw(800); // Outputs: Withdrew 800. New balance: 1700
savingsAccount.addInterest(); // Outputs: Added interest: 85. New balance: 1785
