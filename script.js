// Scroll karne par cards aur sections smoothly dikhenge
const items = document.querySelectorAll(".card, #services h2, #booking h2, #booking p");

items.forEach((item) => item.classList.add("reveal"));

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("show");
    }
  });
}, { threshold: 0.2 });

items.forEach((item, index) => {
  item.style.transitionDelay = (index % 4) * 0.12 + "s";
  observer.observe(item);
});
// ---------- BOOKING SYSTEM ----------
const form = document.getElementById("bookingForm");
const tableBody = document.getElementById("tableBody");
const emptyMsg = document.getElementById("emptyMsg");

// Purani bookings browser ki memory se nikalo
let bookings = JSON.parse(localStorage.getItem("bookings")) || [];

// Aaj se pehle ki date select na ho
document.getElementById("date").min = new Date().toISOString().split("T")[0];

function saveBookings() {
  localStorage.setItem("bookings", JSON.stringify(bookings));
}

function showBookings() {
  tableBody.innerHTML = "";
  emptyMsg.style.display = bookings.length === 0 ? "block" : "none";

  bookings.forEach((b, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${index + 1}</td>
      <td></td>
      <td></td>
      <td></td>
      <td>${b.service} (₹${b.price})</td>
      <td>${b.date}</td>
      <td>
        <select class="status-select status-${b.status.replace(" ", "")}" data-id="${b.id}">
          <option ${b.status === "Pending" ? "selected" : ""}>Pending</option>
          <option ${b.status === "In Progress" ? "selected" : ""}>In Progress</option>
          <option ${b.status === "Completed" ? "selected" : ""}>Completed</option>
        </select>
      </td>
        <td><button class="bill-btn" data-id="${b.id}">Bill</button></td>
      <td><button class="delete-btn" data-id="${b.id}">X</button></td>
    `;
    // Text safe tareeke se daalo
    row.children[1].textContent = b.name;
    row.children[2].textContent = b.phone;
    row.children[3].textContent = b.bikeModel + " (" + b.bikeNumber + ")";
    tableBody.appendChild(row);
  });
}

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const [serviceName, price] = document.getElementById("service").value.split("|");

  const booking = {
    id: Date.now(),
    name: document.getElementById("name").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    bikeModel: document.getElementById("bikeModel").value.trim(),
    bikeNumber: document.getElementById("bikeNumber").value.trim().toUpperCase(),
    service: serviceName,
    price: Number(price),
    date: document.getElementById("date").value,
    status: "Pending"
  };

  bookings.push(booking);
  saveBookings();
  showBookings();
  form.reset();
  alert("Booking ho gayi! ✅");
});

// Status badalna aur delete karna
tableBody.addEventListener("change", function (e) {
  if (e.target.classList.contains("status-select")) {
    const id = Number(e.target.dataset.id);
    const booking = bookings.find((b) => b.id === id);
    booking.status = e.target.value;
    saveBookings();
    showBookings();
  }
});

tableBody.addEventListener("click", function (e) {
  if (e.target.classList.contains("delete-btn")) {
    const id = Number(e.target.dataset.id);
    bookings = bookings.filter((b) => b.id !== id);
    saveBookings();
    showBookings();
  }
});

showBookings();
// ---------- BILL ----------
const billModal = document.getElementById("billModal");
const billBody = document.getElementById("billBody");

// Naam jaise text ko safe banane ke liye
function safe(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

tableBody.addEventListener("click", function (e) {
  if (e.target.classList.contains("bill-btn")) {
    const id = Number(e.target.dataset.id);
    const b = bookings.find((x) => x.id === id);

    const gst = Math.round(b.price * 0.18);
    const total = b.price + gst;
    const billNo = "BILL-" + String(b.id).slice(-6);

    billBody.innerHTML = `
      <h2>🏍️ Bike Services Management System</h2>
      <p class="bill-no">${billNo}</p>
      <hr>
      <p><strong>Customer:</strong> ${safe(b.name)}</p>
      <p><strong>Phone:</strong> ${safe(b.phone)}</p>
      <p><strong>Bike:</strong> ${safe(b.bikeModel)} (${safe(b.bikeNumber)})</p>
      <p><strong>Date:</strong> ${b.date}</p>
      <p><strong>Status:</strong> ${b.status}</p>
      <hr>
      <table class="bill-table">
        <tr><td>${safe(b.service)}</td><td>₹${b.price}</td></tr>
        <tr><td>GST (18%)</td><td>₹${gst}</td></tr>
        <tr class="bill-total"><td>Total</td><td>₹${total}</td></tr>
      </table>
      <p class="thanks">Dhanyavaad! Fir milenge 🙏</p>
    `;
    billModal.classList.add("open");
  }
});

document.getElementById("closeBill").addEventListener("click", function () {
  billModal.classList.remove("open");
});

document.getElementById("printBill").addEventListener("click", function () {
  window.print();
});

// ---------- SERVICE HISTORY ----------
const historySearch = document.getElementById("historySearch");
const historyResult = document.getElementById("historyResult");

function showHistory() {
  const text = historySearch.value.trim().toUpperCase();

  if (text === "") {
    historyResult.innerHTML = "<p id='emptyMsg'>Pehle bike number likho.</p>";
    return;
  }

  const found = bookings.filter((b) => b.bikeNumber.includes(text));

  if (found.length === 0) {
    historyResult.innerHTML = "<p id='emptyMsg'>Is bike ki koi service nahi mili.</p>";
    return;
  }

  let totalSpent = 0;
  let rows = "";

  found.forEach((b) => {
    totalSpent += b.price;
    rows += `
      <tr>
        <td>${b.date}</td>
        <td>${safe(b.bikeNumber)}</td>
        <td>${safe(b.service)}</td>
        <td>₹${b.price}</td>
        <td>${b.status}</td>
      </tr>`;
  });

  historyResult.innerHTML = `
    <table>
      <thead>
        <tr><th>Date</th><th>Bike No.</th><th>Service</th><th>Amount</th><th>Status</th></tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <p class="history-total">Total Services: ${found.length} &nbsp;|&nbsp; Total Kharcha: ₹${totalSpent}</p>
  `;
}

document.getElementById("historyBtn").addEventListener("click", showHistory);
historySearch.addEventListener("keyup", showHistory);