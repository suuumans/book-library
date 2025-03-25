const bookContainer = document.getElementById('bookContainer');
const searchBar = document.getElementById('searchBar');
const sortBySelect = document.getElementById('sortBy');
const listViewBtn = document.getElementById('listViewBtn');
const gridViewBtn = document.getElementById('gridViewBtn');
const loadingDiv = document.getElementById('loading');

const apiUrl = 'https://api.freeapi.app/api/v1/public/books';
let currentPage = 1;
let allBooks = [];
let displayedBooks = [];
let isListView = true;
let loadingMore = false;
let totalPages = Infinity;

// Function to fetch books
async function fetchBooks(page = 1) { // Default page is 1
    // Set loading state to "Loading more books..."
    loadingDiv.style.display = 'block';
    try {
        const response = await fetch(`${apiUrl}?page=${page}`);
        const data = await response.json();
        console.log("api response data: ",data);
        

        // Check if the request was successful
        if (data.statusCode === 200 && data.data) {
            const newBooks = data.data.data;
            // Add new books to the existing list
            allBooks = allBooks.concat(newBooks);
            // Update total pages
            totalPages = data.data.totalPages;
            filterAndDisplayBooks();
            if (currentPage >= totalPages) {
                loadingDiv.textContent = 'No more books to load.';
            } else {
                loadingDiv.style.display = 'none';
            }
            loadingMore = false;
        } else {
            console.error('Failed to fetch books:', data);
            loadingDiv.textContent = 'Failed to load books.';
        }
    } catch (error) {
        console.error('Error fetching books:', error);
        loadingDiv.textContent = 'Error loading books.';
    }
}

// Function to display books
function displayBooks(books) {
    // Clear existing books
    bookContainer.innerHTML = '';
    books.forEach(book => {
        const bookItem = document.createElement('div');
        bookItem.classList.add('book-item');

        const thumbnail = document.createElement('img');
        // Check if thumbnail exists
        thumbnail.src = book.volumeInfo.imageLinks?.thumbnail || 'placeholder.png';
        // Set the alt text to the title
        thumbnail.alt = book.volumeInfo.title;

        const details = document.createElement('div');
        details.classList.add('book-details');

        const title = document.createElement('h3');
        // Set the text content to the title
        title.textContent = book.volumeInfo.title;

        const author = document.createElement('p');
        // Set the text content to the authors, or 'Unknown' if not available
        author.textContent = `Author: ${book.volumeInfo.authors?.join(', ') || 'Unknown'}`;

        const publisher = document.createElement('p');
        // Set the text content to the publisher, or 'Unknown' if not available
        publisher.textContent = `Publisher: ${book.volumeInfo.publisher || 'Unknown'}`;

        const publishedDate = document.createElement('p');
        // // Set the text content to the published date, or 'Unknown' if not available
        publishedDate.textContent = `Published: ${book.volumeInfo.publishedDate ? new Date(book.volumeInfo.publishedDate).toLocaleDateString() : 'Unknown'}`;

        // Append elements to the book item
        details.appendChild(title);
        details.appendChild(author);
        details.appendChild(publisher);
        details.appendChild(publishedDate);

        bookItem.appendChild(thumbnail);
        bookItem.appendChild(details);

        bookItem.addEventListener('click', () => {
            // // Open the book's infoLink in a new tab when clicked
            window.open(book.volumeInfo.infoLink, '_blank');
        });

        bookContainer.appendChild(bookItem);
    });
}

// Function to filter and display books based on search and sort criteria
function filterAndDisplayBooks() {
    // / Get the search term from the input and convert to lowercase
    const searchTerm = searchBar.value.toLowerCase();
    const sortBy = sortBySelect.value;

    // // Create a copy of all books to perform filtering
    let filteredBooks = [...allBooks];

    // Filter books based on search term
    if (searchTerm) {
        filteredBooks = filteredBooks.filter(book =>
            book.volumeInfo.title.toLowerCase().includes(searchTerm) ||
            (book.volumeInfo.authors && book.volumeInfo.authors.some(author => author.toLowerCase().includes(searchTerm)))
        );
    }

    if (sortBy === 'title') {
        filteredBooks.sort((a, b) => a.volumeInfo.title.localeCompare(b.volumeInfo.title));
    } else if (sortBy === 'publishedDate') {
        filteredBooks.sort((a, b) => {
            const dateA = new Date(a.volumeInfo.publishedDate || '1900-01-01'); // Default date for sorting
            const dateB = new Date(b.volumeInfo.publishedDate || '1900-01-01');
            return dateA - dateB;
        });
    }

    // Update displayed books with filtered books
    displayedBooks = filteredBooks;
    // Display filtered books
    displayBooks(displayedBooks);
}

// Function to toggle between list and grid views
function toggleView(isList) {
    isListView = isList;
    bookContainer.classList.toggle('grid-view', !isList);
    bookContainer.classList.toggle('list-view', isList);
    listViewBtn.classList.toggle('active', isList);
    gridViewBtn.classList.toggle('active', !isList);
}

// Event listener for scrolling to implement pagination
window.addEventListener('scroll', () => {
    // Check if more books need to be loaded
    if (loadingMore || allBooks.length === 0 || currentPage >= totalPages) return;

    // Get scroll position and viewport height
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    // If the user is near the bottom of the page (within 20 pixels)
    if (scrollTop + clientHeight >= scrollHeight - 20) {
        loadingMore = true;
        currentPage++;
        // Fetch the next set of books
        fetchBooks(currentPage);
    }
});

// Event listeners for user interactions

// call filertAndDisplayBooks when the user types in the search bar
searchBar.addEventListener('input', filterAndDisplayBooks);
sortBySelect.addEventListener('change', filterAndDisplayBooks);
listViewBtn.addEventListener('click', () => toggleView(true));
gridViewBtn.addEventListener('click', () => toggleView(false));

// Initial fetch
fetchBooks();