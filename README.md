# SmartSupply 🚚📦

## Real-World Supply Chain Transportation Cost Optimization Using Linear Programming

SmartSupply is a web-based **Operations Research / Optimization Techniques** project designed to solve real-world transportation problems by determining efficient shipment allocations between multiple sources and destinations while minimizing transportation cost.

The system provides an interactive interface where users can enter transportation costs, supply quantities, and demand requirements. It automatically checks whether the problem is balanced or unbalanced and generates transportation solutions using classical transportation methods.

---

## 📌 Project Overview

In real-world supply chains, companies transport products from multiple factories, warehouses, or suppliers to multiple destinations.

The transportation cost depends on:

* Source
* Destination
* Quantity transported
* Transportation cost per unit
* Available supply
* Required demand

Manually finding a suitable transportation plan can become difficult when the number of sources and destinations increases.

**SmartSupply** provides an interactive solution that allows users to:

1. Create a transportation problem.
2. Enter supply and demand values.
3. Enter transportation costs.
4. Detect balanced or unbalanced problems.
5. Automatically add a dummy source or destination when required.
6. Calculate transportation allocations.
7. Compare different transportation methods.
8. Visualize transportation costs and allocations.
9. Perform what-if analysis.
10. Recalculate the solution when conditions change.

---

# 🎯 Objectives

The main objectives of SmartSupply are:

* Minimize transportation costs.
* Efficiently allocate supply to destinations.
* Demonstrate classical transportation methods.
* Automate transportation problem calculations.
* Handle balanced and unbalanced transportation problems.
* Compare transportation methods.
* Provide a professional interactive dashboard.
* Support what-if analysis for changing business conditions.
* Demonstrate the practical application of Operations Research.

---

# 🚀 Key Features

## 1. Dynamic Transportation Problem Builder

Users can create their own transportation problem by entering:

* Source names
* Destination names
* Transportation costs
* Supply quantities
* Demand quantities

The transportation matrix is generated dynamically.

---

## 2. Sample Dataset

The project includes a sample transportation dataset representing factories and warehouses.

### Sources

* Nagpur Factory
* Pune Factory
* Delhi Factory

### Destinations

* Mumbai Warehouse
* Pune Warehouse
* Delhi Warehouse
* Nashik Warehouse

### Sample Transportation Costs

| Source         | Mumbai | Pune | Delhi | Nashik |
| -------------- | -----: | ---: | ----: | -----: |
| Nagpur Factory |      8 |    6 |    10 |      9 |
| Pune Factory   |      5 |    4 |     9 |      7 |
| Delhi Factory  |     11 |    8 |     3 |      6 |

### Sample Supply

| Source         | Supply |
| -------------- | -----: |
| Nagpur Factory |    500 |
| Pune Factory   |    400 |
| Delhi Factory  |    600 |

### Sample Demand

| Destination      | Demand |
| ---------------- | -----: |
| Mumbai Warehouse |    450 |
| Pune Warehouse   |    550 |
| Delhi Warehouse  |    500 |
| Nashik Warehouse |      0 |

Total supply and total demand are both **1500 units**, making the sample problem balanced.

---

# ⚙️ Transportation Methods

SmartSupply implements three classical transportation methods.

## 1. Northwest Corner Method

The Northwest Corner Method starts allocation from the top-left cell of the transportation table.

The method:

1. Starts from the northwest corner.
2. Allocates the maximum possible quantity.
3. Adjusts supply and demand.
4. Moves to the next appropriate row or column.
5. Continues until all supply and demand requirements are satisfied.

It provides an initial feasible transportation solution.

---

## 2. Least Cost Method

The Least Cost Method selects the transportation cell having the lowest cost.

The method:

1. Finds the lowest transportation cost.
2. Allocates the maximum possible quantity.
3. Updates supply and demand.
4. Removes satisfied rows or columns.
5. Continues until the transportation problem is completed.

This method attempts to obtain a lower-cost initial feasible solution compared with arbitrary allocation approaches.

---

## 3. Vogel's Approximation Method (VAM)

Vogel's Approximation Method uses penalties to determine which row or column should receive priority.

The method:

1. Calculates penalties for rows and columns.
2. Selects the highest penalty.
3. Finds the lowest-cost cell in that row or column.
4. Allocates the maximum possible quantity.
5. Updates supply and demand.
6. Recalculates penalties.
7. Continues until the transportation table is completed.

VAM is commonly used to obtain a good initial feasible transportation solution.

> **Academic Note:** Northwest Corner, Least Cost, and VAM are transportation solution methods for constructing feasible allocations. VAM is an approximation/heuristic method and should not be described as a mathematical proof of global optimality by itself.

---

# ⚖️ Balanced and Unbalanced Problems

SmartSupply automatically checks:

```text
Total Supply = Total Demand
```

If:

```text
Total Supply = Total Demand
```

the problem is balanced.

If:

```text
Total Supply > Total Demand
```

the system adds a **Dummy Destination**.

If:

```text
Total Demand > Total Supply
```

the system adds a **Dummy Source**.

This allows the transportation problem to be converted into a balanced form before applying the transportation methods.

---

# 🔄 Project Workflow

```text
User
  │
  ▼
Create / Load Transportation Problem
  │
  ▼
Enter Supply, Demand & Transportation Costs
  │
  ▼
Validate Input
  │
  ▼
Check Balance
  │
  ├── Balanced ───────────────┐
  │                           │
  ├── Unbalanced              │
  │      │                    │
  │      ▼                    │
  │  Add Dummy Source/        │
  │  Destination              │
  │                           │
  └───────────────┬───────────┘
                  ▼
         Transportation Methods
                  │
         ┌────────┼─────────┐
         ▼        ▼         ▼
       NWC    Least Cost    VAM
         │        │         │
         └────────┼─────────┘
                  ▼
           Cost Comparison
                  │
                  ▼
           Allocation Results
                  │
                  ▼
            Charts & Analytics
                  │
                  ▼
           What-If Simulation
                  │
                  ▼
           Recalculate Solution
```

---

# 📊 Results Dashboard

After optimization, SmartSupply displays:

* Transportation cost
* Initial/reference cost
* Cost savings
* Savings percentage
* Total transported units
* Method comparison
* Transportation allocation matrix
* Optimization status

The dashboard provides a visual representation of the calculated transportation plan.

---

# 📈 Analytics

SmartSupply includes interactive charts for analyzing transportation results.

### Cost Comparison Chart

Compares the total transportation cost generated by:

* Northwest Corner
* Least Cost
* Vogel's Approximation

### Savings Chart

Displays the cost difference between the selected/reference solution and other calculated solutions.

### Allocation Chart

Provides a visual representation of transportation allocations between sources and destinations.

Charts are implemented using **Chart.js**.

---

# 🔬 What-If Scenario Simulator

The What-If Simulator allows users to test changes in the transportation problem.

Users can modify:

* Transportation cost
* Source supply
* Destination demand

For example:

```text
Original transportation cost:
₹8 per unit

New transportation cost:
₹10 per unit
```

The system recalculates the transportation solution and displays:

* Original cost
* New cost
* Cost difference
* Percentage change
* New allocation

This demonstrates how transportation decisions can change when real-world business conditions change.

---

# 🖥️ User Interface

SmartSupply uses a modern dashboard-style interface with:

* Deep navy background
* White rounded dashboard cards
* Blue factory/source nodes
* Teal warehouse/destination nodes
* Orange/amber optimization indicators
* Responsive layout
* Interactive transportation matrix
* Analytics charts
* What-if simulator

The design focuses on presenting Operations Research calculations in a clean and understandable business interface.

---

# 🏗️ System Architecture

```text
┌───────────────────────────────────────────────┐
│                 SmartSupply                   │
├───────────────────────────────────────────────┤
│                                               │
│              Frontend Layer                   │
│                                               │
│       HTML + CSS + JavaScript + Chart.js      │
│                       │                       │
│                       ▼                       │
│               Flask Web Server                │
│                       │                       │
│                       ▼                       │
│              Optimization Layer               │
│                                               │
│     ┌────────────┬────────────┬───────────┐   │
│     │ Northwest  │ Least Cost │    VAM    │   │
│     │   Corner   │            │           │   │
│     └────────────┴────────────┴───────────┘   │
│                       │                       │
│                       ▼                       │
│              Results & Analytics              │
│                       │                       │
│                       ▼                       │
│               What-If Analysis                │
│                                               │
└───────────────────────────────────────────────┘
```

---

# 📁 Project Structure

```text
SmartSupply/
│
├── app.py
├── requirements.txt
├── Procfile
├── README.md
├── .gitignore
├── .python-version
│
├── data/
│   └── sample_transportation.csv
│
├── optimization/
│   ├── __init__.py
│   ├── transportation.py
│   ├── northwest_corner.py
│   ├── least_cost.py
│   └── vogel.py
│
├── templates/
│   └── index.html
│
└── static/
    ├── css/
    │   └── style.css
    │
    └── js/
        └── main.js
```

---

# 🛠️ Technology Stack

## Frontend

* HTML5
* CSS3
* JavaScript
* Chart.js

## Backend

* Python
* Flask

## Data Processing

* Pandas
* NumPy

## Optimization

* Python-based transportation algorithms
* Operations Research transportation methods

## Deployment

* GitHub
* Render
* Gunicorn

---

# 📦 Python Libraries

The project uses:

```text
Flask
pandas
numpy
scipy
gunicorn
```

---

# 🔌 API Endpoints

## Home

```text
GET /
```

Loads the SmartSupply web application.

---

## Sample Dataset

```text
GET /api/sample-data
```

Returns the sample:

* Sources
* Destinations
* Transportation costs
* Supply
* Demand

---

## Optimization

```text
POST /api/optimize
```

Receives a transportation problem and calculates:

* Northwest Corner solution
* Least Cost solution
* Vogel's Approximation solution
* Transportation costs
* Allocation matrices
* Balance information
* Comparison results

---

# 📄 Sample Dataset

The project includes:

```text
data/sample_transportation.csv
```

Dataset format:

```csv
source,destination,cost
Nagpur Factory,Mumbai Warehouse,8
Nagpur Factory,Pune Warehouse,6
Nagpur Factory,Delhi Warehouse,10
Nagpur Factory,Nashik Warehouse,9
Pune Factory,Mumbai Warehouse,5
Pune Factory,Pune Warehouse,4
Pune Factory,Delhi Warehouse,9
Pune Factory,Nashik Warehouse,7
Delhi Factory,Mumbai Warehouse,11
Delhi Factory,Pune Warehouse,8
Delhi Factory,Delhi Warehouse,3
Delhi Factory,Nashik Warehouse,6
```

---

# 💻 Installation

## 1. Clone the Repository

```bash
git clone https://github.com/pushpakgaidhane294/Smart_Supply_OT.git
```

Move into the project:

```bash
cd Smart_Supply_OT
```

---

## 2. Create Virtual Environment

For Python 3.11:

```bash
py -3.11 -m venv venv
```

Activate the environment on Windows:

```bash
venv\Scripts\activate
```

---

## 3. Install Dependencies

```bash
pip install -r requirements.txt
```

---

# ▶️ Run the Project Locally

Start the Flask application:

```bash
python app.py
```

The application will run locally at:

```text
http://127.0.0.1:5000
```

Open the URL in your browser.

---

# 🧪 How to Use SmartSupply

## Step 1 — Load Sample Dataset

Click:

```text
Load Sample Dataset
```

The system loads the predefined factories, warehouses, costs, supply, and demand.

---

## Step 2 — Create a New Problem

Click:

```text
Create New Problem
```

The system creates a blank transportation problem.

Users can enter:

* Transportation costs
* Supply
* Demand

---

## Step 3 — Validate the Problem

The system checks:

```text
Total Supply
Total Demand
```

and determines whether the problem is:

```text
Balanced
```

or:

```text
Unbalanced
```

---

## Step 4 — Run Optimization

Click:

```text
Run Optimization
```

The backend calculates all three transportation methods:

```text
Northwest Corner
Least Cost
Vogel's Approximation
```

---

## Step 5 — Compare Results

The dashboard displays the transportation cost generated by each method.

Users can compare the calculated solutions using the cost comparison section.

---

## Step 6 — View Allocation

The allocation matrix shows how many units should be transported from each source to each destination.

Example:

```text
Source → Destination
        Quantity
```

---

## Step 7 — Analyze Charts

Use the analytics section to view:

* Cost comparison
* Savings
* Transportation allocation

---

## Step 8 — Perform What-If Analysis

Modify:

* Transportation cost
* Supply
* Demand

Then run the scenario to see how the transportation result changes.

---

# 🌐 Deployment on Render

SmartSupply can be deployed using Render.

## Render Configuration

### Build Command

```bash
pip install -r requirements.txt
```

### Start Command

```bash
gunicorn app:app
```

The project contains a `Procfile`:

```text
web: gunicorn app:app
```

---

# 📄 requirements.txt

```text
Flask
pandas
numpy
scipy
gunicorn
```

---

# 📄 Procfile

```text
web: gunicorn app:app
```

---

# 📄 .python-version

```text
3.11
```

---

# 🎓 Academic Relevance

This project demonstrates concepts from:

* Operations Research
* Optimization Techniques
* Linear Programming
* Transportation Problems
* Cost Minimization
* Feasible Solutions
* Supply-Demand Balancing
* Decision Support Systems
* What-If Analysis

The project converts a theoretical transportation problem into an interactive real-world decision-support application.

---

# 🏭 Real-World Applications

The SmartSupply concept can be applied to:

### Manufacturing

Determine how products should be transported from factories to warehouses.

### Retail

Allocate products from distribution centers to stores.

### Logistics

Compare transportation plans between multiple locations.

### E-Commerce

Optimize shipment allocation between warehouses and delivery regions.

### Agriculture

Plan movement of agricultural products from collection centers to markets.

### Pharmaceutical Supply Chain

Allocate products from manufacturing units to distribution centers.

---

# 💡 Example Real-World Problem

Suppose a company has:

```text
3 Factories
4 Warehouses
```

Each factory has a limited supply and each warehouse has a specific demand.

Different transportation routes have different costs.

The company wants to determine:

```text
How many units should be transported
from each factory to each warehouse?
```

while keeping the total transportation cost as low as possible.

SmartSupply provides a computational framework for evaluating this transportation problem using classical transportation methods.

---

# 🔄 Dynamic Re-Optimization

One important feature of SmartSupply is dynamic scenario analysis.

For example, if fuel prices increase, transportation costs may change.

Instead of manually recalculating the transportation plan, the user can modify the affected cost and run the scenario again.

Similarly, if:

```text
Factory Supply Changes
```

or:

```text
Warehouse Demand Changes
```

the system can recalculate the transportation allocations.

---

# 📊 Decision-Support Capabilities

SmartSupply is designed as a small decision-support system.

It provides:

```text
Input Data
     ↓
Problem Validation
     ↓
Balance Detection
     ↓
Transportation Calculation
     ↓
Method Comparison
     ↓
Cost Analysis
     ↓
What-If Simulation
     ↓
Decision Support
```

---

# 🔐 Security Note

The current version is designed as an academic/project demonstration application.

It does not include:

* User authentication
* Role-based access control
* Production database authentication
* Enterprise security infrastructure

Authentication and enterprise-level access control can be added as future enhancements if required.

---

# 🚀 Future Scope

Possible future improvements include:

* Linear Programming Solver integration
* Exact optimal solution using optimization solvers
* Larger transportation networks
* Database integration
* User accounts
* Scenario history
* Cloud database
* Advanced supply-chain analytics
* Route visualization
* Geographic map integration
* Real-time transportation costs
* Multiple product types
* Vehicle capacity constraints
* Warehouse capacity constraints
* Carbon-emission optimization
* Multi-objective optimization
* Automated report generation
* PDF/Excel export
* AI-assisted supply-chain recommendations

---

# 📚 Learning Outcomes

Through this project, the following concepts are demonstrated:

* Understanding transportation problems
* Applying Operations Research methods
* Implementing transportation algorithms
* Handling balanced and unbalanced problems
* Working with matrices
* Developing a Flask backend
* Creating dynamic web interfaces
* Connecting frontend and backend APIs
* Creating interactive charts
* Performing what-if analysis
* Deploying a Python web application

---

# ⭐ Project Highlights

```text
✓ Real-world transportation problem
✓ Operations Research based
✓ Dynamic transportation matrix
✓ Supply and demand handling
✓ Balanced/unbalanced detection
✓ Dummy source/destination support
✓ Northwest Corner Method
✓ Least Cost Method
✓ Vogel's Approximation Method
✓ Cost comparison
✓ Allocation visualization
✓ What-if scenario analysis
✓ Interactive dashboard
✓ Flask REST API
✓ Chart.js analytics
✓ GitHub repository
✓ Render deployment ready
```

---

# 🧠 Problem Statement

## Problem

Organizations often need to transport goods from multiple supply locations to multiple demand locations.

Transportation costs differ between locations, while each source has limited supply and each destination has a required demand.

Without systematic optimization, transportation planning can result in inefficient allocation and higher costs.

## Proposed Solution

SmartSupply provides an interactive transportation optimization system that models supply, demand, and transportation costs and evaluates transportation allocations using classical transportation methods.

The system also provides comparison, visualization, and what-if analysis capabilities.

---

# 🎯 Project Outcome

The final application provides a practical demonstration of how Operations Research techniques can be implemented in a software system.

Instead of solving transportation tables manually, users can interact with a web-based dashboard to:

```text
Create Problem
      ↓
Enter Data
      ↓
Validate
      ↓
Balance
      ↓
Calculate
      ↓
Compare
      ↓
Visualize
      ↓
Simulate
```

This makes the theoretical transportation problem easier to understand and demonstrate in a practical environment.

---

# 🔗 GitHub Repository

**SmartSupply – Optimization Techniques Project**

```text
https://github.com/pushpakgaidhane294/Smart_Supply_OT
```

---

# 👨‍💻 Developer

**Pushpak Gaidhane**

SmartSupply was developed as an academic project for demonstrating **Optimization Techniques and Operations Research concepts using a real-world supply-chain transportation scenario.**

---

# 📜 License

This project is intended primarily for educational and academic purposes.

You may modify and extend the project for learning, experimentation, and academic demonstrations.

---

# 🏁 Conclusion

SmartSupply demonstrates how classical Operations Research transportation methods can be transformed into a practical web-based decision-support application.

The project combines:

```text
Operations Research
        +
Transportation Optimization
        +
Python
        +
Flask
        +
JavaScript
        +
Interactive Visualization
```
