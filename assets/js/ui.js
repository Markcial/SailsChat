(function(){
	ui = {};
	ui.modal = function(content,heading,options){
    
    var defaults = {
      keyboard:true,
      backdrop:'static',
      show:true
    };

		var opts = $.extend(defaults,options)
		var tpl = '<!-- Modal -->' +
		'<div class="modal fade" id="UImodalWindow" tabindex="-1" role="dialog" aria-labelledby="UImodalWindow" aria-hidden="true">' +
  		'<div class="modal-dialog">' +
   		'<div class="modal-content">' +
      	'<div class="modal-header">' +
        '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' +
        '<h4 class="modal-title" id="UImodalTitleLabel"></h4>' +
        '</div>' +
		'<div class="modal-body"></div>' +
    	'<div class="modal-footer">' +
        '<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>' +
        '<button type="button" class="btn btn-primary">Save changes</button>' +
    	'</div>' +
    	'</div>' +
  		'</div>' +
		'</div>';
		$('body').append(tpl);
		$('#UImodalWindow').modal(opts)
	};

  ui.alerts = {};

  var ContextualAlert = function ContextualAlert(severity){
    if(! (this instanceof ContextualAlert) )
    {
        throw { 
          name:'InstantiationException',
          message: 'should be called with new keyword!'
        };
    };
    var calert = function CAlert(content,appendTo){
      if(! (this instanceof CAlert) )
      {
          throw { 
            name:'InstantiationException',
            message: 'should be called with new keyword!'
          };
      };
      if(typeof(content) == 'undefined')content = '';
      if(typeof(appendTo) == 'undefined')appendTo = '#content';
      this._content = content;
      this._appendTo = $(appendTo);
      var _tpl = '<div class="alert alert-'+this._severity+' fade in">' +
        '<button aria-hidden="true" data-dismiss="alert" class="close" type="button">×</button>' +
        '<span class="label"><i class="fa fa-thumbs-up"></i> Ok</span>' +
        '<div class="message"></div>' +
        '</div>';
      var $tpl = $(_tpl);
      $tpl.find('.message').html(this._content);
      this._appendTo.append($tpl);
    };
    calert.prototype._severity = severity;
    return calert;
  }

  $.each(['success','info','warning','danger'],function(i,el){
    ui.alerts[el] = new ContextualAlert(el);
  });

  ui.quirks = function(){
      $(document).ready(function(){
         // async forms
         $('form[data-async]').on('submit',function(e){
            var $this = $(this);
            var $bt = $this.find('button');
            $.ajax({
                url:$this.attr('action'),
                type:$this.attr('method'),
                beforeSend:function(xhr, settings){
                    $bt.button('loading');
                },
                data:$this.serializeArray(),
                success:function(data, text, xhr){
                    debugger;
                    if( data.error )
                    {
                        new ui.alerts.error( data.message, $this );
                        debugger;
                    }
                    else
                    {

                    }
                },
                error:function(xhr, text, error){
                    new ui.alerts.danger( error, $this );
                },
                complete:function(xhr, text){
                    $bt.button('reset');
                }
            });
            return false;
         });
      });
  };
  if( $('body').data('ui-quirks') )
  {
      ui.quirks();
  }
})()