const courses = [
    {
        subject: "CSE",
        number: 110,
        title: "Introduction to Programming",
        credits: 2,
        completed: true
    },
    {
        subject: "WDD",
        number: 130,
        title: "Web Fundamentals",
        credits: 2,
        completed: true
    },
    {
        subject: "CSE",
        number: 111,
        title: "Programming with Functions",
        credits: 2,
        completed: true
    },
    {
        subject: "CSE",
        number: 210,
        title: "Programming with Classes",
        credits: 2,
        completed: false
    },
    {
        subject: "WDD",
        number: 131,
        title: "Dynamic Web Fundamentals",
        credits: 2,
        completed: true
    },
    {
        subject: "WDD",
        number: 231,
        title: "Frontend Web Development I",
        credits: 2,
        completed: false
    }
];

document.querySelector("#currentYear").textContent = new Date().getFullYear();
document.querySelector("#lastModified").textContent = document.lastModified;

const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#primary-navigation");

menuToggle.addEventListener("click", () => {
    navigation.classList.toggle("is-open");
});

const courseList = document.querySelector("#course-list");
const courseCount = document.querySelector("#course-count");
const creditTotal = document.querySelector("#course-credit-total");
const courseFilterButtons = document.querySelectorAll("[data-course-filter]");

function renderCourses(filter = "all") {
    const displayedCourses = courses.filter(course =>
        filter === "all" || course.subject === filter
    );

    courseList.replaceChildren(...displayedCourses.map(course => {
        const card = document.createElement("li");
        card.classList.add("course-card");
        if (course.completed) {
            card.classList.add("is-completed");
        }

        const code = document.createElement("h3");
        code.className = "course-code";
        code.textContent = `${course.subject} ${course.number}`;

        const title = document.createElement("p");
        title.className = "course-title";
        title.textContent = course.title;

        const credits = document.createElement("p");
        credits.className = "course-credits";
        credits.textContent = `${course.credits} credits`;

        const status = document.createElement("span");
        status.className = "course-status";
        status.textContent = course.completed ? "Completed" : "Not completed";

        card.append(code, title, credits, status);
        return card;
    }));

    courseCount.textContent = displayedCourses.length;
    creditTotal.textContent = displayedCourses.reduce(
        (total, course) => total + course.credits,
        0
    );
}

courseFilterButtons.forEach(button => {
    button.addEventListener("click", () => renderCourses(button.dataset.courseFilter));
});

renderCourses();