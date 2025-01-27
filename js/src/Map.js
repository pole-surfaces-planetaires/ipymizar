
const widgets = require('@jupyter-widgets/base');
// const L = require('./leaflet.js');
const Mizar = require('regards-mizar').default
const utils = require('./utils.js');
// const proj = require('./projections.js');

export class MizarMapModel extends widgets.DOMWidgetModel {
  defaults() {
    return {
      ...super.defaults(),
      _view_name: 'MizarMapView',
      _model_name: 'MizarMapModel',
      _model_module: 'jupyter-mizar',
      _view_module: 'jupyter-mizar',
      crs: 'CRS:84',
      layers: [],
      center: [0.0, 0.0],
      zoom_opts: {}
    };
  }

  initialize(attributes, options) {
    super.initialize(attributes, options);
    this.set('window_url', window.location.href);
  }
}

MizarMapModel.serializers = {
  ...widgets.DOMWidgetModel.serializers,
  layers: { deserialize: widgets.unpack_models },
};

export class MizarMapView extends utils.MizarDOMWidgetView {
  initialize(options) {
    super.initialize(options);
  }

  /**
   * When component dies, remove the interval that checks is Mizar canvas is well sized
   */
  remove() {
    window.clearInterval(this.mizarParentAttrIntervalId);
  }

  remove_layer_view(child_view) {
    let layerID = child_view.obj.getID();
    const result = this.obj.removeLayer(layerID);
    child_view.remove();
    this.obj.getActivatedContext().refresh();
  }

  add_layer_model(child_model) {
    return this.create_child_view(child_model, {
      map_view: this
    }).then(view => {
      return view;
    });
  }

  stopWheel(event) {
    event.returnValue = false; // Return false to stop mouse wheel to be propagated when using onmousewheel
    return false;
  }

  render() {
    super.render();
    this.el.classList.add('jupyter-widgets');
    this.el.classList.add('mizar-widgets');
    this.map_container = document.createElement('canvas');
    // Fix mouse wheel
    this.map_container.addEventListener("mousewheel", this.stopWheel, { passive: false });
    this.map_container.addEventListener("DOMMouseScroll", this.stopWheel, { passive: false });

    // Add Mizar canvas to DOM
    this.el.appendChild(this.map_container);

    // Makes temporal layers works (ノಠ益ಠ)ノ彡┻━┻
    this.timeTravelDiv = document.createElement('div');
    this.timeTravelDiv.setAttribute("id", "timeTravelDiv");
    this.el.appendChild(this.timeTravelDiv);

    this.layer_views = new widgets.ViewList(
      this.add_layer_model,
      this.remove_layer_view,
      this
    );
    this.displayed.then(this.render_mizar.bind(this));
  }

  /**
   * Checks every 300 ms if the canvas is correct using the canvas parent real size
   */
  watchMizarCanvasSize() {
    this.mizarParentAttrIntervalId = setInterval(function(self){
      const attrHeight = parseInt(self.map_container.getAttribute("height"), 10)
      const attrWidth = parseInt(self.map_container.getAttribute("width"), 10)
      const currentHeight = self.el.offsetHeight
      const currentWidth = self.el.offsetWidth
      if(currentHeight !== attrHeight || currentWidth !== attrWidth){
        self.map_container.setAttribute("height", currentHeight) 
        self.map_container.setAttribute("width", currentWidth) 
        // Fix pixel not squared
        self.obj.getActivatedContext().refresh()
      }
    }, 300, this);
  }

  render_mizar() {
    this.create_obj().then(() => {
      this.layer_views.update(this.model.get('layers'));
      this.model_events();
      this.watchMizarCanvasSize()

      return this;
    });
  }

  /**
   * Build the Mizar config object and launch it
   */
  create_obj() {
    return this.layoutPromise.then(() => {
      var mizarOptions = {
        // the canvas ID where Mizar is inserted
        canvas: this.map_container
      };
      var crs = this.model.get('crs');
      if (this.model.get('zoom_opts')['distance']) {
        var initTarget = this.model.get('center').concat(this.model.get('zoom_opts')['distance'])
      } else {
        var initTarget = this.model.get('center')
      }
      var context = {
        coordinateSystem: {
          geoideName: crs
        },
        navigation: {
          initTarget: initTarget,
        }
      };
      switch (Mizar.CRS_TO_CONTEXT[crs]) {
        case 'Planet':
          mizarOptions.planetContext = context;
          break;
        case 'Sky':
          mizarOptions.skyContext = context;
          break;
        default:
          console.error(`Hay un problema con el context`);
      }
      this.obj = new Mizar(mizarOptions)
    });
  }

  /**
   * Track Python variables changed
   */
  model_events() {
    this.listenTo(
      this.model,
      'change:center change:zoom_opts',
      function () {
        var nav = this.obj.getActivatedContext().getNavigation();
        var geoPos = this.model.get('center')
        var options = this.model.get('zoom_opts')
        nav.zoomTo(geoPos, options);
      },
      this
    );
    this.listenTo(
      this.model,
      'change:layers',
      function () {
        this.layer_views.update(this.model.get('layers'));
      },
      this
    );
    this.listenTo(
      this.model,
      'change:time',
      function () {
        var time = this.model.get('time')
        this.obj.setTime(time)
      },
      this
    );
  }

  processLuminoMessage(msg) {
    console.log("processLuminoMessage", msg)
    super.processLuminoMessage(msg);
  }
}
