import Page from 'classes/Page'

import { mapEach } from 'utils/dom'
import { split } from 'utils/text'

export default class extends Page {
  constructor () {
    super({
      id: 'domains',

      classes: {
        active: 'domains--active'
      },

      element: '.domains',
      elements: {
        wrapper: '.domains__wrapper',

        articlesDescriptions: '.domains__article__description'
      }
    })
  }

  /**
   * Animations.
   */
  async show (url) {
    this.element.classList.add(this.classes.active)

    mapEach(this.elements.articlesDescriptions, element => {
      split({
        element,
        expression: '<br>'
      })

      split({
        element,
        expression: '<br>'
      })
    })

    return super.show(url)
  }

  async hide (url) {
    this.element.classList.remove(this.classes.active)

    return super.hide(url)
  }
}
