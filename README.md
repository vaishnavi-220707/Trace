# TRACE — The Intelligent Campus Recovery System

<p align="center">
  <strong>Lost something? Let's bring it back.</strong>
</p>

<p align="center">
  A smart campus Lost & Found platform that connects lost belongings with their potential owners through intelligent matching.
</p>

---

## About TRACE

TRACE is a web-based campus recovery platform designed to simplify the process of reporting, discovering and recovering misplaced belongings.

Students often lose items such as earphones, wallets, ID cards, keys, books and other everyday essentials within campus. Meanwhile, someone else may have found the same item but has no easy way to connect with its owner.

TRACE bridges this gap through an organised Lost & Found reporting system and a JavaScript-based matching engine that identifies potential matches using item attributes such as category, keywords, colour, location and date.

Rather than manually searching through reports, users can discover possible matches through a structured and interactive platform.

---

## The Problem

Traditional campus Lost & Found systems are often manual, fragmented and inefficient.

- Students don't know where to search for lost belongings.
- Found items may remain unclaimed.
- Lost and found reports are scattered across different communication channels.
- Matching a lost item with a found item is usually a manual process.

## Our Solution

TRACE brings lost and found reports into a single platform and uses attribute-based matching to suggest potentially identical items.

The platform enables users to:

- Report lost and found items.
- Discover relevant item reports.
- Identify possible matches automatically.
- Understand why a match is suggested.
- Review and resolve matched reports.
- Track campus recovery activity.

---

## Features

### 🔎 Smart Matching Engine
Compares Lost and Found reports using weighted matching criteria to identify potential matches.

### 📊 Interactive Dashboard
Displays dynamic statistics for lost reports, found reports, potential matches and recovered items.

### 📝 Lost & Found Reporting
Submit reports with item details, category, colour, location, date and description.

### 🎯 Match Explanations
Understand why the system suggests a match by displaying matching attributes.

### 🔍 Search & Filtering
Search reports using keywords and filter by category, location and report status.

### 🔄 Match Review Workflow
Review suggested matches and confirm or reject them. Confirmed matches can be marked as recovered.

### 💾 Local Persistence
Uses browser LocalStorage to preserve application data across page refreshes.

### 🖼️ Image Preview
Preview optional item images while creating reports.

### 📱 Responsive Design
Designed to adapt to desktop, laptop, tablet and mobile screens.

### ✨ Interactive UI
Includes modern UI elements, smooth transitions, hover effects, animations and 3D-inspired visual interactions.

---

## How Smart Matching Works

TRACE uses a weighted scoring algorithm to compare Lost and Found item reports.

| Matching Attribute | Weight |
|---|---:|
| Category Match | 30 points |
| Name & Keyword Similarity | 30 points |
| Colour Match | 20 points |
| Location Match | 15 points |
| Date Proximity | 5 points |
| **Total** | **100 points** |

The matching system evaluates these attributes and generates a score based on the similarities between two reports.

Potential matches above a defined threshold are displayed to the user with an explanation of the matched attributes.

The matching logic is implemented using JavaScript without relying on external AI APIs.

---

## Tech Stack

| Technology | Purpose |
|---|---|
| HTML5 | Structure and semantic content |
| CSS3 | Styling, animations and responsive design |
| JavaScript ES6+ | Matching logic, validation, DOM manipulation and state management |
| Bootstrap 5 | Responsive layout and UI components |
| LocalStorage | Browser-based persistence |

---

## Application Workflow

1. A student reports a lost item.
2. Another student reports a found item.
3. TRACE compares both reports.
4. The matching engine evaluates item attributes.
5. Possible matches are displayed with a match score.
6. Users review the suggested match.
7. A confirmed match can be marked as recovered.

---

## Project Structure

```text
TRACE/
│
├── index.html
├── style.css
├── script.js
│
└── assets/
    └── images/
```

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/TRACE.git
```

### 2. Navigate to the Project Directory

```bash
cd TRACE
```

### 3. Open the Application

Open `index.html` directly in your browser or use the Live Server extension in Visual Studio Code.

No backend setup or database installation is required.

---

## Design Philosophy

TRACE combines functionality with a modern and visually engaging experience.

- Clean and intuitive navigation.
- Light-themed visual identity.
- Modern cards and layered UI.
- Responsive layouts.
- Interactive transitions.
- Visual match indicators.
- User-focused reporting workflows.

The goal is to make campus item recovery more accessible, organised and efficient.

---

## Future Enhancements

- AI-powered image similarity matching.
- QR-based item identification.
- Campus authentication.
- Notification system for potential matches.
- Admin dashboard for managing recovery reports.
- Backend integration for real-time collaboration.
- Location-based item discovery.

---

## Demo Disclaimer

TRACE is a frontend prototype developed for educational and demonstration purposes.

All demonstration data is fictional. The application does not currently provide a real campus-wide recovery service.

---

## Contributing

Contributions, ideas and improvements are welcome.

If you'd like to improve TRACE, feel free to fork the repository and submit a pull request.

---

## Author

Developed as a frontend development project exploring interactive web design, JavaScript-based matching algorithms and real-world problem solving.

---

<p align="center">
  <strong>TRACE — Lost something? Let's bring it back.</strong>
</p>
```

