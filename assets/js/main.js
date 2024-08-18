const STORAGE_KEY = 'BOOKSHELF_APPS';
let books = [];

document.addEventListener('DOMContentLoaded', function () {
  const bookForm = document.getElementById('bookForm');
  bookForm.addEventListener('submit', function (event) {
    event.preventDefault();
    addBook();
  });

  if (isStorageExist()) {
    loadBooksFromStorage();
  }
});

function isStorageExist() {
  return typeof(Storage) !== 'undefined';
}

function saveData() {
  const parsed = JSON.stringify(books);
  localStorage.setItem(STORAGE_KEY, parsed);
}

function loadBooksFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    books = data;
  }

  renderBooks();
}

function generateId() {
  return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year,
    isComplete,
  };
}

function addBook() {
  const bookTitle = document.getElementById('bookFormTitle').value;
  const bookAuthor = document.getElementById('bookFormAuthor').value;
  const bookYear = parseInt(document.getElementById('bookFormYear').value);
  const bookIsComplete = document.getElementById('bookFormIsComplete').checked;

  const generatedID = generateId();
  const bookObject = generateBookObject(generatedID, bookTitle, bookAuthor, bookYear, bookIsComplete);
  books.push(bookObject);

  document.getElementById('bookForm').reset();

  saveData();
  renderBooks();
}

function renderBooks() {
  const incompleteBookList = document.getElementById('incompleteBookList');
  const completeBookList = document.getElementById('completeBookList');

  incompleteBookList.innerHTML = '';
  completeBookList.innerHTML = '';

  for (book of books) {
    const bookElement = makeBookElement(book);

    if (!book.isComplete) {
      incompleteBookList.append(bookElement);
    } else {
      completeBookList.append(bookElement);
    }
  }
}

function addBookToCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isComplete = true;
  saveData();
  renderBooks();
}

function undoBookFromCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isComplete = false;
  saveData();
  renderBooks();
}

function removeBookFromShelf(bookId) {
  const bookTarget = findBookIndex(bookId);

  if (bookTarget === -1) return;

  books.splice(bookTarget, 1);
  saveData();
  renderBooks();
}

function findBook(bookId) {
  for (book of books) {
    if (book.id === bookId) {
      return book;
    }
  }
  return null;
}

function findBookIndex(bookId) {
  for (index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }
  return -1;
}

document.getElementById('searchBook').addEventListener('submit', function (event) {
    event.preventDefault();
    searchBooks();
  });
  
  function searchBooks() {
    const searchTitle = document.getElementById('searchBookTitle').value.toLowerCase();
    const filteredBooks = books.filter(book => book.title.toLowerCase().includes(searchTitle));
    renderBooks(filteredBooks);
  }
  
  function renderBooks(filteredBooks = books) {
    const incompleteBookList = document.getElementById('incompleteBookList');
    const completeBookList = document.getElementById('completeBookList');
  
    incompleteBookList.innerHTML = '';
    completeBookList.innerHTML = '';
  
    for (const book of filteredBooks) {
      const bookElement = makeBookElement(book);
  
      if (!book.isComplete) {
        incompleteBookList.append(bookElement);
      } else {
        completeBookList.append(bookElement);
      }
    }
  }

  function makeBookElement(book) {
    const bookTitle = document.createElement('h3');
    bookTitle.innerText = book.title;
    bookTitle.setAttribute('data-testid', 'bookItemTitle');
  
    const bookAuthor = document.createElement('p');
    bookAuthor.innerText = `Penulis: ${book.author}`;
    bookAuthor.setAttribute('data-testid', 'bookItemAuthor');
  
    const bookYear = document.createElement('p');
    bookYear.innerText = `Tahun: ${book.year}`;
    bookYear.setAttribute('data-testid', 'bookItemYear');
  
    const bookContainer = document.createElement('div');
    bookContainer.classList.add('book-item');
    bookContainer.setAttribute('data-bookid', book.id);
    bookContainer.setAttribute('data-testid', 'bookItem');
  
    bookContainer.append(bookTitle, bookAuthor, bookYear);
    
    const actionContainer = document.createElement('div');
    
    const deleteButton = document.createElement('button');
    deleteButton.innerText = 'Hapus Buku';
    deleteButton.setAttribute('data-testid', 'bookItemDeleteButton');
    deleteButton.addEventListener('click', function () {
      removeBookFromShelf(book.id);
    });
    
    const editButton = document.createElement('button');
    editButton.innerText = 'Edit Buku';
    editButton.setAttribute('data-testid', 'bookItemEditButton');
    editButton.addEventListener('click', function () {
      openEditForm(book.id);
    });
    
    const toggleButton = document.createElement('button');
    toggleButton.setAttribute('data-testid', 'bookItemIsCompleteButton');
    if (book.isComplete) {
      toggleButton.innerText = 'Belum Selesai Dibaca';
      toggleButton.addEventListener('click', function () {
        undoBookFromCompleted(book.id);
      });
    } else {
      toggleButton.innerText = 'Selesai Dibaca';
      toggleButton.addEventListener('click', function () {
        addBookToCompleted(book.id);
      });
    }
  
    actionContainer.append(toggleButton, deleteButton, editButton);
    bookContainer.append(actionContainer);
  
    return bookContainer;
  }
  
  function openEditForm(bookId) {
    const book = findBook(bookId);
    if (!book) return;
  
    document.getElementById('bookFormTitle').value = book.title;
    document.getElementById('bookFormAuthor').value = book.author;
    document.getElementById('bookFormYear').value = book.year;
    document.getElementById('bookFormIsComplete').checked = book.isComplete;
  
    const form = document.getElementById('bookForm');
    form.removeEventListener('submit', addBook);
    form.addEventListener('submit', function(event) {
      event.preventDefault();
      updateBook(bookId);
    });
  }
  
  function updateBook(bookId) {
    const bookTitle = document.getElementById('bookFormTitle').value;
    const bookAuthor = document.getElementById('bookFormAuthor').value;
    const bookYear = parseInt(document.getElementById('bookFormYear').value);
    const bookIsComplete = document.getElementById('bookFormIsComplete').checked;
  
    const book = findBook(bookId);
    if (!book) return;
  
    book.title = bookTitle;
    book.author = bookAuthor;
    book.year = bookYear;
    book.isComplete = bookIsComplete;
  
    saveData();
    renderBooks();
  
    document.getElementById('bookForm').reset();
    const form = document.getElementById('bookForm');
    form.removeEventListener('submit', updateBook);
    form.addEventListener('submit', addBook);
  }

  document.getElementById('bookFormIsComplete').addEventListener('change', function() {
    const submitButtonText = document.getElementById('bookFormSubmit').querySelector('span');
    if (this.checked) {
      submitButtonText.innerText = 'Selesai dibaca';
    } else {
      submitButtonText.innerText = 'Belum selesai dibaca';
    }
  });
  
  