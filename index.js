const modal = {
  open() {
    document.querySelector('.modal-overlay')
      .classList
      .add('active')
  },

  close() {
    document.querySelector('.modal-overlay')
      .classList
      .remove('active')
  }
}

const Storage = {
  get() {
    return JSON.parse(localStorage.getItem('finances:transactions')) || []
  },

  set(transactions) {
    localStorage.setItem('finances:transactions', JSON.stringify(transactions))
  }
}

const Transaction = {
  all: Storage.get(),

  remove(index) {
    Transaction.all.splice(index, 1)
    App.reload()
  },

  add(transaction) {
    Transaction.all.push(transaction)
    App.reload()
  },

  incomes() {
    let income = 0
    Transaction.all.forEach(transaction => {
      if (transaction.amount > 0) {
        income += transaction.amount
      }
    })
    return income
  },

  expenses() {
    let expense = 0
    Transaction.all.forEach(transaction => {
      if (transaction.amount < 0) {
        expense += transaction.amount
      }
    })
    return expense
  },

  total() {
    return Transaction.incomes() + Transaction.expenses()
  }
}

const dom = {
  transactionsContainer: document.querySelector('#data-table tbody'),

  addTransaction(transaction, index) {
    const tr = document.createElement('tr')
    tr.innerHTML = dom.innerHTMLTransaction(transaction, index)
    tr.dataset.index = index
    dom.transactionsContainer.appendChild(tr)
  },

  innerHTMLTransaction(transaction, index) {
    const CSSclass = transaction.amount > 0 ? "income" : "expense"
    const amount = Utils.formatCurrency(transaction.amount)
    const html = 
    `
      <td class="description">${transaction.description}</td>
      <td class="${CSSclass}">${amount}</td>
      <td class="date">${transaction.date}</td>
      <td>
        <img src="./assets/minus.svg" alt="Remover" onclick="Transaction.remove(${index})">
      </td>
    `
    return html
  },

  updateBalance() {
    document
      .getElementById('incomeDisplay')
      .innerHTML = Utils.formatCurrency(Transaction.incomes())
    document
      .getElementById('expenseDisplay')
      .innerHTML = Utils.formatCurrency(Transaction.expenses())
    document
      .getElementById('totalDisplay')
      .innerHTML = Utils.formatCurrency(Transaction.total())
  },

  clearTransactions() {
    dom.transactionsContainer.innerHTML = ''
  }
}

const Utils = {
  formatAmount(value) {
    value = Number(value) * 100
    return value
  },

  formatDate(date) {
    const splittedDate = date.split("-")
    return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
  },

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

const form = {
  description: document.querySelector('input#description'),
  amount: document.querySelector('input#amount'),
  date: document.querySelector('input#date'),

  getValues() {
    return {
      description: form.description.value,
      amount: form.amount.value,
      date: form.date.value
    }
  },

  formatValues() {
    let {description, amount, date} = form.getValues()
    amount = Utils.formatAmount(amount)
    date = Utils.formatDate(date)
    return {
      description,
      amount,
      date
    }
  },

  validateFields() {
    const {description, amount, date} = form.getValues()
    if (description.trim() === ''
    || amount.trim() === ''
    || date.trim() === '') {
      throw new Error('Por favor preencha todos os campos')
    }
  },

  clearFields() {
    form.description.value = ''
    form.amount.value = ''
    form.date.value = ''
  },

  submit(event) {
    event.preventDefault()
    try {
      form.validateFields()
      const transaction = form.formatValues()
      Transaction.add(transaction)
      form.clearFields()
      modal.close()
    } catch (error) {
      alert(error.message)
    }
  }
}

const App = {
  init() {
    Transaction.all.forEach((transaction, index) => {
      dom.addTransaction(transaction, index)
    })

    dom.updateBalance()

    Storage.set(Transaction.all)
  },

  reload() {
    dom.clearTransactions()
    App.init()
  }
}

App.init()
