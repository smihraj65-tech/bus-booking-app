# SwiftBus - Bus Ticket Booking Management Web Application

A full-featured, modern responsive Bus Ticket Booking web application built with **HTML5, CSS3, JavaScript (ES6+), Bootstrap 5, and Axios**, integrated with **CrudCrud REST API** backend for persistent CRUD operations.

---

## 🚀 Features

- **Passenger Ticket Booking (POST)**: Add bookings with Name, Email, 10-digit Phone, and Bus Service selection (`Bus 1`, `Bus 2`, `Bus 3`).
- **Real-Time Data Fetching (GET)**: Automatically loads all bookings on page load using Axios from CrudCrud API.
- **Dynamic Bus Filtering**: Filter passenger lists dynamically by:
  - All Buses
  - Bus 1 (Morning Express)
  - Bus 2 (Afternoon Deluxe)
  - Bus 3 (Night AC Sleeper)
- **Edit Booking (PUT)**: Click "Edit" to load passenger info into the form, make changes, and update details on the cloud database.
- **Delete / Cancel Booking (DELETE)**: Remove bookings with instant confirmation and UI feedback.
- **Live Search**: Instant keyword search by Passenger Name, Email, or Phone number.
- **Dynamic Statistics Counter**: Real-time counter cards showing total bookings and breakdown per bus.
- **Configurable CrudCrud Endpoint**: Inbuilt input to set or update the unique CrudCrud API key with persistent `localStorage` support.
- **Interactive Toast Notifications**: Instant visual feedback for successful bookings, edits, and deletions.
- **Modern Responsive UI**: Clean typography (Plus Jakarta Sans), gradients, soft shadows, and mobile-friendly design.

---

## 🛠️ Tech Stack

- **HTML5 & CSS3**: Semantic layout and modern CSS styling.
- **JavaScript (ES6+)**: Async/await, DOM manipulation, and event handling.
- **Axios**: Promised-based HTTP client for RESTful CRUD operations.
- **Bootstrap 5 & Bootstrap Icons**: Responsive grid and icon set.
- **CrudCrud REST API**: Cloud backend endpoint for REST operations.

---

## 💻 How to Run Locally

1. Open `index.html` in any modern web browser.
2. (Optional) Provide your own [crudcrud.com](https://crudcrud.com) endpoint key in the top banner if the default key expires.
3. Book, filter, edit, and manage bus tickets seamlessly!
