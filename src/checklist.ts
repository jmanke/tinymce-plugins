export default function checklist(editor, url) {
  let checklistBtn

  function rootNode(element, parentTag) {
    if (!element) {
      return
    }

    let curr = element
    while (curr.parentElement.nodeName !== parentTag) {
      curr = curr.parentElement
    }

    return curr
  }

  function createChecklist() {
    const ul = document.createElement('ul')
    ul.classList.add('tox-checklist')

    // gather elements in between start and end
    let start = rootNode(editor.selection.getStart(), 'BODY')
    let end = rootNode(editor.selection.getEnd(), 'BODY')
    let curr = start

    const nodesToRemove = []

    do {
      const li = document.createElement('li')
      if (curr.nodeName === 'P') {
        li.textContent = curr.textContent
      } else {
        li.appendChild(curr.cloneNode(true))
      }
      const br = document.createElement('br')
      br.setAttribute('data-mce-bogus', '1')
      li.appendChild(br)
      ul.appendChild(li)

      nodesToRemove.push(curr)
      curr = curr.nextSibling
    } while (curr && curr !== end.nextSibling)

    editor.dom.replace(ul, start, false)

    nodesToRemove.forEach((node) => editor.dom.remove(node))

    editor.focus()
  }

  function removeChecklist() {
    // gather elements in between start and end
    const start = rootNode(editor.selection.getStart(), 'BODY')
    const end = rootNode(editor.selection.getEnd(), 'BODY')
    let curr = start

    const range = editor.selection.getSel()

    const checkListItems = new Set()
    do {
      const items = curr.querySelectorAll('.tox-checklist li')
      items.forEach((item) => {
        if (range.containsNode(item, true)) {
          checkListItems.add(item)
        }
      })

      curr = curr.nextSibling
    } while (curr && curr !== end.nextSibling)

    checkListItems.forEach((item: any) => {
      const parentNode = item.parentElement
      const splitNode = editor.dom.split(parentNode, item)
      const p = document.createElement('p')
      editor.dom.replace(p, splitNode, true)
    })

    editor.focus()
  }

  /**
   * Plugin behaviour for when the Toolbar or Menu item is selected
   *
   * @private
   */
  function _onAction() {
    if (checklistBtn.isActive()) {
      removeChecklist()
      return
    }

    createChecklist()
  }

  function _onSetup(btn) {
    checklistBtn = btn
  }

  // Define the Toolbar button
  editor.ui.registry.addToggleButton('checklist', {
    icon: 'checklist',
    tooltip: 'Insert check list',
    onAction: _onAction,
    onSetup: _onSetup,
  })

  editor.on('click', function (event) {
    if (event.offsetX >= 0) {
      return
    }
    const node = event.composedPath()?.[0]
    const parent = node?.parentElement

    if (!parent) {
      return
    }

    if (parent.className === 'tox-checklist') {
      if (
        node.nodeName === 'LI' &&
        node.className === 'tox-checklist--checked'
      ) {
        node.className = ''
      } else if (node.nodeName === 'LI' && node.className === '') {
        node.className = 'tox-checklist--checked'
      }
    }
  })

  editor.on('nodeChange', function (event) {
    const parent = event.element?.parentElement

    if (!parent) {
      return
    }

    const isChecklist = parent.className.search('tox-checklist') !== -1

    if (isChecklist) {
      checklistBtn.setActive(true)
    } else {
      checklistBtn.setActive(false)
    }
  })
}
