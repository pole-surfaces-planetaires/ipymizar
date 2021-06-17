
const widgets = require('@jupyter-widgets/base');
// const PMessaging = require('@lumino/messaging');
// const PWidgets = require('@lumino/widgets');
// const L = require('../leaflet.js');
// const utils = require('../utils.js');
// const Mizar = require('regards-mizar').default

export class MizarLayerModel extends widgets.WidgetModel {
  defaults() {
    return {
      ...super.defaults(),
      _view_name: 'MizarLayerView',
      _model_name: 'MizarLayerModel',
      _view_module: 'jupyter-mizar',
      _model_module: 'jupyter-mizar',
      crs: '',
      opacity: 1.0,
      // bottom: false,
      // options: [],
      name: '',
      base: false,
      // popup: null,
      // popup_min_width: 50,
      // popup_max_width: 300,
      // popup_max_height: null
    };
  }
}

MizarLayerModel.serializers = {
  ...widgets.WidgetModel.serializers,
  // popup: { deserialize: widgets.unpack_models }
};

export class MizarUILayerModel extends MizarLayerModel {
  defaults() {
    return {
      ...super.defaults(),
      _view_name: 'MizarUILayerView',
      _model_name: 'MizarUILayerModel'
    };
  }
  /**
   * Return the configuration related to any Mizar layer
   */
  getBasicConf() {
    const conf = {}
    if (this.model.get('crs')) {
      conf.crs = this.model.get('crs')
    }
    if (this.model.get('opacity')) {
      conf.crs = this.model.get('opacity')
    }
    if (this.model.get('background')) {
      conf.crs = this.model.get('background')
    }
    return conf
  }
}

export class MizarLayerView extends utils.MizarWidgetView {
  initialize(parameters) {
    super.initialize(parameters);
    this.map_view = this.options.map_view;
    // this.popup_content_promise = Promise.resolve();
  }

  render() {
    return Promise.resolve(this.create_obj()).then(() => {
      this.mizar_events();
      this.model_events();
      // this.bind_popup(this.model.get('popup'));
      // this.listenTo(this.model, 'change:popup', function(model, value) {
      //   this.bind_popup(value);
      // });
    });
  }

  mizar_events() {
    // If the layer is interactive
    // if (this.obj.on) {
    //   this.obj.on(
    //     'click dblclick mousedown mouseup mouseover mouseout',
    //     event => {
    //       this.send({
    //         event: 'interaction',
    //         type: event.type,
    //         coordinates: [event.latlng.lat, event.latlng.lng]
    //       });
    //     }
    //   );
    //   this.obj.on('popupopen', event => {
    //     // This is a workaround for making maps rendered correctly in popups
    //     window.dispatchEvent(new Event('resize'));
    //   });
    //   this layer is transformable
    //   if (this.obj.transform) {
    //     // add the handler only when the layer has been added
    //     this.obj.on('add', () => {
    //       this.update_transform();
    //     });
    //     this.obj.on('transformed', () => {
    //       this.model.set('locations', this.obj.getLatLngs());
    //       this.touch();
    //     });
    //   }
    // }
  }

  model_events() {
    var key;
    var o = this.model.get('options');
    for (var i = 0; i < o.length; i++) {
      key = o[i];
      this.listenTo(
        this.model,
        'change:' + key,
        function() {
          L.setOptions(this.obj, this.get_options());
        },
        this
      );
    }
    // this.model.on_some_change(
    //   ['popup_min_width', 'popup_max_width', 'popup_max_height'],
    //   this.update_popup,
    //   this
    // );
  }

  remove() {
    super.remove();
    // this.popup_content_promise.then(() => {
    //   if (this.popup_content) {
    //     this.popup_content.remove();
    //   }
    // });
  }

  // bind_popup(value) {
  //   if (this.popup_content) {
  //     this.obj.unbindPopup();
  //     this.popup_content.remove();
  //   }
  //   if (value) {
  //     this.popup_content_promise = this.popup_content_promise.then(() => {
  //       return this
  //         .create_child_view(value, { map_view: this.map_view })
  //         .then(view => {
  //           // If it's a Popup widget
  //           if (value.name == 'MizarPopupModel') {
  //             this.obj.bindPopup(view.obj, this.popup_options());
  //           } else {
  //             PMessaging.MessageLoop.sendMessage(
  //               view.pWidget,
  //               PWidgets.Widget.Msg.BeforeAttach
  //             );
  //             this.obj.bindPopup(view.el, this.popup_options());
  //             PMessaging.MessageLoop.sendMessage(
  //               view.pWidget,
  //               PWidgets.Widget.Msg.AfterAttach
  //             );
  //           }
  //           this.popup_content = view;
  //           this.trigger('popup_content:created');
  //         });
  //     });
  //   }
  //   return this.popup_content_promise;
  // }

  // popup_options() {
  //   return {
  //     minWidth: this.model.get('popup_min_width'),
  //     maxWidth: this.model.get('popup_max_width'),
  //     maxHeight: this.model.get('popup_max_height')
  //   };
  // }

  // update_popup() {
  //   L.setOptions(this.obj.getPopup(), this.popup_options());

  //   // Those TWO lines will enforce the options update
  //   this.obj.togglePopup();
  //   this.obj.togglePopup();
  // }
}
