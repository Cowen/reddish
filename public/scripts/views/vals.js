(function() {

  window.Reddish || (window.Reddish = {});

  Reddish.ValuesView = Backbone.View.extend({
    el: '#values',
    initialize: function() {
      _.bindAll(this, 'add', 'resize', 'scroll');
      this.collection.bind('add', this.add, this);
      this.collection.bind('reset', this.reset, this);
      this.collection.bind('remove', this.remove, this);
      this.$el = $(this.el);
      this.$wrapper = this.$el.children('#values-list-wrapper');
      this.$values = this.$wrapper.children('#values-list');
      this.$empty = this.$el.children('#values-empty');
      this.$wrapper.on('scroll', this.scroll);
      $(window).on('resize', this.resize);
      this.currScroll = this.prevScroll = 0;
      this.startIndex = this.prevStartIndex = 0;
      this.height = 0;
      this.minItemHeight = 92;
      this.wrapperHeight = this.$wrapper.outerHeight();
      this.visibleItems = Math.ceil(this.wrapperHeight / this.minItemHeight);
      this.endIndex = this.prevEndIndex = this.bufferSize = this.visibleItems * 3;
      return this.views = {};
    },
    resize: _.debounce(function() {
      this.wrapperHeight = this.$wrapper.outerHeight();
      this.visibleItems = Math.ceil(this.wrapperHeight / this.minItemHeight);
      return this.bufferSize = this.visibleItems * 3;
    }, 250),
    scroll: _.throttle(function() {
      var direction, end_remove_range, end_render_range, i, index, model, remove_models, render_models, start_remove_range, start_render_range, _i, _len,
        _this = this;
      this.currScroll = this.$wrapper.scrollTop();
      if (this.currScroll > this.prevScroll) {
        direction = 'down';
      } else if (this.currScroll < this.prevScroll) {
        direction = 'up';
      } else {
        return;
      }
      this.prevStartIndex = this.startIndex;
      this.prevEndIndex = this.endIndex;
      model = this.collection.find(function(model) {
        var top;
        return top = model.get('top') >= _this.currScroll;
      });
      index = this.collection.indexOf(model);
      this.startIndex = index - this.visibleItems;
      if (this.startIndex < 0) {
        this.startIndex = 0;
      }
      this.endIndex = this.startIndex + this.bufferSize;
      if (direction === 'down') {
        start_render_range = Math.max(this.prevEndIndex, this.startIndex);
        end_render_range = this.endIndex;
        start_remove_range = this.prevStartIndex;
        end_remove_range = this.startIndex;
      } else {
        start_render_range = this.startIndex;
        end_render_range = Math.min(this.prevStartIndex, this.endIndex);
        start_remove_range = this.endIndex;
        end_remove_range = this.prevEndIndex;
      }
      render_models = this.collection.models.slice(start_render_range, end_render_range);
      for (i in render_models) {
        model = render_models[i];
        this.render(model, start_render_range + parseInt(i));
      }
      remove_models = this.collection.models.slice(start_remove_range, end_remove_range);
      for (_i = 0, _len = remove_models.length; _i < _len; _i++) {
        model = remove_models[_i];
        this.remove(model);
      }
      return this.prevScroll = this.currScroll;
    }, 250),
    add: function(model) {
      var index;
      index = this.collection.length - 1;
      if ((this.startIndex <= index && index < this.endIndex)) {
        this.render(model);
      }
      return this.$empty.hide();
    },
    render: function(model) {
      var $el, el, top, view;
      view = new Reddish.ValueView({
        model: model,
        collection: this.collection
      });
      this.views[model.cid] = view;
      el = view.render().el;
      this.$values.append(el);
      if (!model.has('top')) {
        $el = view.$el;
        model.set({
          top: top = this.height
        });
        this.height += $el.outerHeight();
        this.$values.css({
          height: this.height
        });
      }
      return el.style.top = "" + (model.get('top')) + "px";
    },
    remove: function(model) {
      var view;
      view = this.views[model.cid];
      if (view != null) {
        view.close();
      }
      return delete this.views[model.cid];
    },
    reset: function() {
      _.each(this.views, function(view) {
        return view.close();
      });
      this.$values.css({
        height: this.height = 0
      });
      /*
          if @collection.length
            @$empty.hide()
          else
            @$empty.show()
      */

      return this.collection.each(this.add);
    }
  });

}).call(this);
