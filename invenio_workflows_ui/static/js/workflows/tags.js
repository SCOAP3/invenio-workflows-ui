/*
 * This file is part of Invenio.
 * Copyright (C) 2014, 2015 CERN.
 *
 * Invenio is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License as
 * published by the Free Software Foundation; either version 2 of the
 * License, or (at your option) any later version.
 *
 * Invenio is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Invenio; if not, write to the Free Software Foundation, Inc.,
 * 59 Temple Place, Suite 330, Boston, MA 02111-1307, USA.
 */


define(
  [
    'jquery',
    'flight',
    'node_modules/bootstrap-tagsinput/dist/bootstrap-tagsinput',
  ],
  function(
    $,
    flight,
    tagsinput) {

    'use strict';

    return flight.component(WorkflowsUITags);

    /**
    * .. js:class:: WorkflowsUITags()
    *
    * Component for handling the filter/search available through the
    * bootstrap-tagsinput element.
    *
    * :param Array tags: list of tags to add from the beginning.
    *
    */
    function WorkflowsUITags() {

      this.attributes({
        tags: null
      });

      this.addTagFromMenu = function(ev, data) {
        // Tagsinput already deal with identical tags, but we need to remove
        // tags from the same menu.
        var that = this;
        if (data.prefix) {
            var tags_to_remove = $.grep(this.$node.tagsinput("items"), function(item, index) {
              return item.value.slice(0, data.prefix.length) == data.prefix;
            });
            $.each(tags_to_remove, function(index, item) {
              that.$node.tagsinput('remove', item)
            })
        }
        this.$node.tagsinput('add', {text: data.text, value: data.value});
      };

      this.addTagFromFreetext = function(ev) {
        // ev.item is the freeinput text
        if (ev.item.length != 0){
          ev.item = {text: ev.item, value: ev.item};
          // event.cancel: set to true to prevent the item getting added
          ev.cancel = false;
        }
      };

      this.getCurrentTags = function() {
        // Extract only the "real" value (ignore translated ones)
        return this.$node.tagsinput("items").map(function(currentValue, index, array) {
          return currentValue.value;
        });
      };

      this.onTagsUpdate = function(ev, data) {
        var payload = {};
        payload.tags = this.getCurrentTags();
        this.trigger(document, "reloadWorkflowsUITable", payload);
        this.trigger(document, "update_url", payload);
      };


      this.after('initialize', function() {
        this.on(document, "addTagFromMenu", this.addTagFromMenu);
        this.on("itemAdded", this.onTagsUpdate);
        this.on("itemRemoved", this.onTagsUpdate);
        this.on('beforeFreeInputItemAdd', this.addTagFromFreetext);

        this.$node.tagsinput({
            tagClass: function (item) {
                switch (item.value) {
                  case '_workflow.status:"In process"':
                    return 'label label-warning';
                  case '_workflow.status:"Need action"':
                    return 'label label-danger';
                  case '_workflow.status:"Waiting"':
                    return 'label label-warning';
                  case '_workflow.status:"Done"':
                    return 'label label-success';
                  case '_workflow.status:"New"':
                    return 'label label-info';
                  case '_workflow.status:"Error"':
                    return 'label label-danger';
                  default:
                    return 'badge badge-warning';
                }
            },
            itemValue: 'value',
            itemText: 'text'
        });
        // Add any existing tags
        var that = this;
        this.attr.tags.map(function(item) {
          that.$node.tagsinput('add', item);
        });
        console.log("Tags init");
      });
    }
});
