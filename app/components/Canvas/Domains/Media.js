import GSAP from 'gsap'
import { Mesh, Program, Transform } from 'ogl'

import Component from 'classes/Component'

import fragment from 'shaders/domains-fragment.glsl'
import vertex from 'shaders/domains-vertex.glsl'

import MediaDOM from './MediaDOM'

export default class extends Component {
  constructor ({ detail, element, geometry, gl, index, scene, sizes }) {
    super({
      element,
      elements: {
        image: '.domains__gallery__media__image'
      }
    })

    this.detail = detail // A detail div for each domainProjects
    this.geometry = geometry // this.geometry = new Plane(this.gl)
    this.gl = gl // the Ogl context
    this.index = index // Which no. it is
    this.scene = scene // the scene / group
    this.sizes = sizes 

    this.animation = 0
    this.group = new Transform()
    this.frame = 0

    this.opacity = {
      current: 0,
      target: 0,
      lerp: 0.1,
      multiplier: 0
    }

    this.createDetail()
    this.createProjectItem()
    this.createModel()

    this.createBounds({
      sizes: this.sizes
    })

    this.original = (-this.sizes.width / 2) + (this.projectItem.scale.x / 2) + (this.x * this.sizes.width)
    // console.log('x is: ', this.x)
    // console.log('this.sizes.width is: ', this.sizes.width)
    // console.log('original is: ', this.original)

    this.group.setParent(this.scene)
  }

  createDetail () {
    this.detailDOM = new MediaDOM({
      element: this.detail
    })

    this.detailDOM.on('close', this.animateOut.bind(this))
  }

  createProjectItem () {
    const program = new Program(this.gl, {
      fragment,
      vertex,
      uniforms: {
        uAlpha: { value: 0 },
        tMap: { value: window.TEXTURES[this.elements.image.getAttribute('data-src')] }
      }
    })

    this.projectItem = new Mesh(this.gl, {
      geometry: this.geometry,
      program
    })

    this.projectItem.index = this.index

    // Add the projectItem to the group
    this.projectItem.setParent(this.group)
  }

  createModel () {
    const program = new Program(this.gl, {
      fragment,
      vertex,
      uniforms: {
        uAlpha: { value: 0 },
        tMap: { value: window.TEXTURES[this.elements.image.getAttribute('data-model-src')] }
      }
    })

    this.model = new Mesh(this.gl, {
      geometry: this.geometry,
      program
    })

    // this.model.rotation.y = Math.PI

    this.model.setParent(this.group)
  }

  createBounds ({ sizes }) {
    this.sizes = sizes
    // console.log('element')
    // console.log(this.element)
    // return
    this.domainsBounds = this.element.getBoundingClientRect()
    console.log(this.domainsBounds)

    this.updateScale()
    this.updateX()
  }

  /**
   * Animations.
   */
  show () {
    GSAP.to(this.opacity, {
      delay: 0.5,
      multiplier: 1
    })
  }

  hide () {
    GSAP.to(this.opacity, {
      multiplier: 0
    })

    this.detailDOM.animateOut()
  }

  /**
   * Events.
   */
  onResize (sizes, scroll) {
    this.detailDOM.onResize()

    this.createBounds(sizes)
    this.updateX(scroll && scroll.x)
  }

  /**
   * Animations.
   */
  animateIn () {
    GSAP.to(this, {
      animation: 1,
      duration: 0.85,
      ease: 'expo.inOut'
    })

    this.detailDOM.animateIn()

    this.emit('open', this.index)
  }

  animateOut () {
    GSAP.to(this, {
      animation: 0,
      duration: 0.65, // org: 2
      ease: 'expo.inOut'
    })

    this.detailDOM.animateOut()

    this.emit('close', this.index)
  }

  /**
   * Loop.
   */
  updateScale () {
    // DecisionSource: Width of scaled detail image (detailsdomain.scss, l.45, detaildomain__media)
    const height = GSAP.utils.interpolate(this.domainsBounds.height, this.detailDOM.bounds.height, this.animation)
    const width = GSAP.utils.interpolate(this.domainsBounds.width, this.detailDOM.bounds.width, this.animation)
    
    // const height = GSAP.utils.interpolate(this.domainsBounds.height, this.detailDOM.bounds.height * 2, this.animation)
    // const width = GSAP.utils.interpolate(this.domainsBounds.width, this.detailDOM.bounds.width * 2, this.animation)
    
    this.height = height / window.innerHeight
    this.width = width / window.innerWidth
    
    // console.log('height: ', height, 'this.height: ', this.height)

    // console.log('sizes')
    // console.log(this.sizes.height)
    // console.log('this.detailDOM.bounds')
    // console.log(this.detailDOM.bounds.height)

    // this.projectItem.scale.x = this.sizes.width * this.width
    // this.projectItem.scale.y = this.sizes.height * this.height
    this.projectItem.scale.x = this.sizes.width * this.width
    this.projectItem.scale.y = this.sizes.height * this.height

    this.model.scale.x = this.sizes.width * this.width
    this.model.scale.y = this.sizes.height * this.height
  }

  updateX (scroll = 0) {
    // Here we place the webgl detail image according to the hidden detail__image style
    const x = GSAP.utils.interpolate(this.domainsBounds.left + scroll, this.detailDOM.bounds.left, this.animation)
    const y = GSAP.utils.interpolate(this.domainsBounds.top + scroll, this.detailDOM.bounds.top, this.animation)
    // console.log('x is: ', x)
    // console.log('y is: ', y)
    
    // const x = GSAP.utils.interpolate(this.domainsBounds.left + scroll, this.sizes.width, this.animation)
    // const x = GSAP.utils.interpolate(this.domainsBounds.left + scroll, 0, this.animation)
    
    this.x = x / window.innerWidth
    this.y = y / window.innerHeight
    // this.y = y
    // console.log('this.x is: ', this.x)
    // console.log('this.y is: ', this.y)

    // The last part makes sure to place y in correct place
    this.group.position.y = (-this.sizes.width / 2) + (this.projectItem.scale.y / 2) + (this.x * this.sizes.height)
    // This keeps the x pos kissing the right side
    this.group.position.x = (this.sizes.width / 2) - (this.projectItem.scale.x / 2)
    // this.group.position.x = (-this.sizes.width / 2) + (this.projectItem.scale.x / 2) + (this.x * this.sizes.width)
    this.group.position.z = GSAP.utils.interpolate(0, 0.1, this.animation)

    // this.group.rotation.y = GSAP.utils.interpolate(0, 2 * Math.PI, this.animation)
  }
  
  updateY (scroll = 0) {

    console.log('updating scroll')

    // const x = GSAP.utils.interpolate(this.domainsBounds.left + scroll, this.detailDOM.bounds.left, this.animation)
    // interpolate(startValue, endValue, progress)
    const y = GSAP.utils.interpolate(this.domainsBounds.top + scroll, 0, this.animation)

    this.y = y / window.innerHeight

    this.group.position.y = (-this.sizes.height / 2) + (this.projectItem.scale.y / 2) + (this.x * this.sizes.width)
    this.group.position.z = GSAP.utils.interpolate(0, 0.1, this.animation)

    // this.group.rotation.y = GSAP.utils.interpolate(0, 2 * Math.PI, this.animation)
  }

  update (scroll, index) {
    this.updateScale()
    this.updateX(scroll)
    // this.updateY(scroll)

    const frequency = 500
    // This makes the a wavy motion like a sine wave
    const amplitude = 0.5

    // const sliderY = Math.sin((this.original / 10 * (Math.PI * 2)) + this.frame / frequency) * amplitude
    const sliderY = Math.sin((this.original / 10 * (Math.PI * 2)) + this.frame / frequency) // W/ out amplitude
    const detailY = 0

    if (this.animation > 0.01) {
      this.projectItem.program.depthTest = false
      this.projectItem.program.depthWrite = false

      this.model.program.depthTest = false
      this.model.program.depthWrite = false
    } else {
      this.projectItem.program.depthTest = true
      this.projectItem.program.depthWrite = true

      this.model.program.depthTest = true
      this.model.program.depthWrite = true
    }

    // this.group.position.y = GSAP.utils.interpolate(sliderY, detailY, this.animation)
    // this.group.position.y = GSAP.utils.interpolate(0, detailY, this.animation)

    // The zoom impact
    // mapRange(inMin, inMax, outMin, outMax, valueToMap)
    const sliderZ = GSAP.utils.mapRange(-this.sizes.width * 0.25, this.sizes.width * 0.25, this.group.position.y * 0.3, -this.group.position.y * 0.3, this.group.position.x)

    // const detailRotZ = Math.PI * 0.01
    const detailRotZ = 0

    // this.group.rotation.z = GSAP.utils.interpolate(sliderZ, detailRotZ, this.animation)

    this.opacity.target = index === this.index ? 1 : 0.4
    this.opacity.current = GSAP.utils.interpolate(this.opacity.current, this.opacity.target, this.opacity.lerp)

    this.projectItem.program.uniforms.uAlpha.value = this.opacity.multiplier * this.opacity.current
    this.model.program.uniforms.uAlpha.value = this.opacity.multiplier * this.opacity.current

    this.frame += 1
  }
}
