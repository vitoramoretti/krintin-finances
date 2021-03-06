const Modal = {
  open() {
    document.querySelector(".modal-overlay").classList.add("active");
  },
  close() {
    document.querySelector(".modal-overlay").classList.remove("active");
  }
};

// Sound Effect
const chingBtn = document.querySelector('.ching');
let chingSound = document.querySelector('#ching');
chingBtn.addEventListener('click' , () => {
    chingSound.play();
})

// Dark Theme
if (localStorage.getItem('isDarkTheme') === 'true') {
    document.querySelector('.toggle-theme').classList.remove("light")
    document.querySelector('.toggle-theme').classList.add("dark")
    document.querySelector('header').classList.add('dark')
    document.querySelector('.card.total').classList.add('dark')
    document.querySelector('.modal').classList.add('dark')
    document.body.classList.add('dark')
}
const themeToggle = document.querySelector('#swtichBtn')

themeToggle.addEventListener('click', () => {
    document.querySelector('.toggle-theme').classList.contains('light') ? enableDarkMode() : enableLightMode()
})

function enableDarkMode() {
    document.querySelector('.toggle-theme').classList.remove("light")
    document.querySelector('.toggle-theme').classList.add("dark")
    document.querySelector('header').classList.add('dark')
    document.querySelector('.card.total').classList.add('dark')
    document.querySelector('.modal').classList.add('dark')
    document.body.classList.add('dark')
    localStorage.setItem('isDarkTheme', true);
}

function enableLightMode() {
    document.querySelector('.toggle-theme').classList.remove("dark")
    document.querySelector('.toggle-theme').classList.add("light")
    document.querySelector('header').classList.remove('dark')
    document.querySelector('.card.total').classList.remove('dark')
    document.querySelector('.modal').classList.remove('dark')
    document.body.classList.remove('dark')
    localStorage.setItem('isDarkTheme', false);
}

// Storage
const Storage = {
    get() {
        return JSON.parse(localStorage.getItem('finances:transactions')) || []
    },

    set(transactions) {
        localStorage.setItem('finances:transactions', JSON.stringify(transactions))
    }
}

// Logics for + and - 
const Transaction = {
    all: Storage.get(),

    add(transaction) {
        Transaction.all.push(transaction)

        App.reload()
    },

    remove(index) {
        Transaction.all.splice(index, 1)

        App.reload()
    },

    incomes() {
        let income = 0;
        Transaction.all.forEach(transaction => {
            if (transaction.amount > 0) {
                income += transaction.amount;
            }
        })
        return income
    },

    expenses() {
        let expense = 0;
        Transaction.all.forEach(transaction => {
            if (transaction.amount < 0) {
                expense += transaction.amount;
            }
        })
        return expense
    },

    total() {
        if(Transaction.incomes() + Transaction.expenses() < 0) {
            document.querySelector(".card.total").classList.add("negative")
        } else document.querySelector(".card.total").classList.remove("negative")
        return Transaction.incomes() + Transaction.expenses();
    }
}

const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index

        DOM.transactionsContainer.appendChild(tr)
    },
    innerHTMLTransaction(transaction, index) {
        const CSSclass = transaction.amount > 0 ? 'income' : 'expense'
        const amount = Utils.formatCurrency(transaction.amount)

        const html = `
        <td class="description">${transaction.description}</td>
        <td class="${CSSclass}">${amount}</td>
        <td class="date">${transaction.date}</td>
        <td>
            <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="remove transaction">
        </td>
        `
        return html
    },

    updateBalance() {
        document.getElementById('incomeDisplay').innerHTML = Utils.formatCurrency(Transaction.incomes())
        document.getElementById('expenseDisplay').innerHTML = Utils.formatCurrency(Transaction.expenses())
        document.getElementById('totalDisplay').innerHTML = Utils.formatCurrency(Transaction.total())
    },
    clearTransactions() {
        DOM.transactionsContainer.innerHTML = ''
    }
}

const Utils = {
    formatAmount(value) {
        value = value * 100

        return Math.round(value)
    },

    formatDate(date) {
        const splittedDate = date.split('-')
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },
    // Converts Number to R$ BRL 
    formatCurrency(value) {
        const signal = Number(value) < 0 ? '-' : ''

        value = String(value).replace(/\D/g, '')

        value = Number(value) / 100
        
        value = value.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        })
        return signal + value
    }
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },

    validateFields() {
        const { description, amount, date} = Form.getValues()

        if (description.trim() === '' || amount.trim() === '' || date.trim() === '') {
            throw new Error('Please, fill in all the fields')
        }
    },

    formatValues() {
        let { description, amount, date} = Form.getValues()

        amount = Utils.formatAmount(amount)

        date = Utils.formatDate(date)

        return {
            description,
            amount,
            date
        }
    },

    saveTransaction(transaction) {
        Transaction.add(transaction)
    },

    clearFields() {
         Form.description.value = ''
         Form.amount.value = ''
         Form.date.value = ''
    },

    submit(event) {
        event.preventDefault()

        try {
            Form.validateFields()
            const transaction = Form.formatValues()
            Form.saveTransaction(transaction)
            Form.clearFields()
            Modal.close()
        } catch (error) {
            alert(error.message)
        }

    }
}

const App = {
    init() {
        // Loops through all transactions
        Transaction.all.forEach(DOM.addTransaction)
    
        DOM.updateBalance()

        Storage.set(Transaction.all)
    },
    reload() {
        DOM.clearTransactions()
        App.init()
    },
}

App.init()
