(function () {

	angular
	    .module('ngDnd', []);

	angular
	    .module('ngDnd')
	    .service('dndData', dndData);
	
	function dndData() {
	    'use strict';
	
	    var data_  = null;
	    var model_ = null;
	    var el_    = null;
	
	    var service = {
	
	        isDragging: isDragging,
	
	        setData: setData,
	        getData: getData,
	        delData: delData,
	
	        dropData: dropData
	    };
	    return service;
	
	    ////////////
	
	    function isDragging() {
	        return model_ !== null;
	    }
	
	    function setData(data, model, el) {
	        data_  = data;
	        model_ = model;
	        el_    = el;
	    }
	
	    function getData() {
	        return data_;
	    }
	
	    function dropData() {
	        model_.dragDrop();
	        model_.dragEnd(el_);
	    }
	
	    function delData() {
	        data_  = null;
	        model_ = null;
	        el_    = null;
	    }
	}

	angular
	    .module('ngDnd')
	    .directive('dndDraggable', ['$log', 'dndData', dndDraggable]);
	
	function dndDraggable($log, dndData) {
	    'use strict';
	
	    var directive = {
	        restrict: 'A',
	        scope: {
	            dndModel: '=dndDraggable'
	        },
	        link: linker,
	        controller: controller,
	        controllerAs: 'vm',
	        bindToController: true
	    };
	
	    return directive;
	
	    function controller() {
	
	        /* jshint validthis: true */
	        var vm = this;
	
	        vm.dragStart = dragStart;
	        vm.dragEnd   = dragEnd;
	        vm.dragDrop  = dragDrop;
	
	        // check client model is present
	        if (vm.dndModel === null) {
	            $log.error('dndDraggabale directive needs a model! e.g. <div dnd-draggable="vm.myDndModel">');
	        }
	
	        function dragStart(el, event) {
	            setDataTransfer(event);
	            dndData.setData(getData(), vm, el);
	
	            if (typeof vm.dndModel.dragStart === 'function') {
	                vm.dndModel.dragStart(el);
	            } else if (vm.dndModel.debug) {
	                $log.info('dndDraggabale: no "dragStart(element)"   function in model: default to do-nothing.');
	            }
	        }
	
	        function dragDrop() {
	            if (typeof vm.dndModel.dragDrop === 'function') {
	                vm.dndModel.dragDrop(dndData.getData());
	            } else if (vm.dndModel.debug) {
	                $log.info('dndDraggabale: no "dragDrop(data)"       function in model: default to do-nothing');
	            }
	        }
	
	        function dragEnd(el) {
	            dndData.delData();
	            if (typeof vm.dndModel.dragEnd === 'function') {
	                vm.dndModel.dragEnd(el);
	            } else if (vm.dndModel.debug) {
	                $log.info('dndDraggable:  no "dragEnd(element)"     function in model: default to do-nothing');
	            }
	        }
	
	        function getData () {
	            if (typeof vm.dndModel.data === 'function') {
	                return vm.dndModel.data();
	            } else {
	                if (vm.dndModel.debug) {
	                    $log.info('dndDraggable:  no "data()"               function in model: default to null');
	                }
	                return null;
	            }
	        }
	
	        // location of dataTransfer depends on whether jquery is present
	        function setDataTransfer(event) {
	            if ('dataTransfer' in event) {
	                event.dataTransfer.setData('text', '');
	            } else if (('originalEvent' in event) &&
	                ('dataTransfer' in event.originalEvent)) {
	                event.originalEvent.dataTransfer.setData('text','');
	            } else{
	                $log.error('dndDraggable could not set the dataTransfer data!');
	            }
	        }
	    }
	
	    function linker(scope, el, attrs, vm) {
	
	        // watch draggable property of client model
	        scope.$watch(isDraggable(), function () {
	            el.attr('draggable', isDraggable()());
	        });
	
	        // listen to drag-related events...
	
	        el.on('dragstart', function (event) {
	            // guard against selected text
	            if (!dndData.isDragging() && isDraggable()()) {
	                vm.dragStart(el, event);
	            }
	        });
	        el.on('dragend', function () {
	            // guard against selected text
	            if (dndData.isDragging()) {
	                vm.dragEnd(el);
	            }
	        });
	
	        function isDraggable() {
	            if (typeof vm.dndModel.isDraggable === 'function') {
	                return vm.dndModel.isDraggable;
	            } else {
	                if (vm.dndModel.debug) {
	                    $log.info('dndDraggabale: no "isDraggable()"        function in model: default to true');
	                }
	                return function () { return true; };
	            }
	        }
	    }
	}

	angular
	    .module('ngDnd')
	    .directive('dndDroppable', ['$log', '$timeout', 'dndData',  dndDroppable]);
	
	function dndDroppable($log, $timeout, dndData) {
	    'use strict';
	
	    var directive = {
	        restrict: 'A',
	        scope: {
	            dndModel: '=dndDroppable'
	        },
	        link: linker,
	        controller: controller,
	        controllerAs: 'vm',
	        bindToController: true
	    };
	
	    return directive;
	
	    function controller() {
	
	        /* jshint validthis: true */
	        var vm = this;
	
	        vm.dragEnter = dragEnter;
	        vm.dragOver  = dragOver;
	        vm.dragLeave = dragLeave;
	        vm.dragDrop  = dragDrop;
	
	        // check client model is present
	        if (vm.dndModel === null) {
	            $log.error('dndDroppable directive needs a model! e.g. <div dnd-droppable="vm.myDndModel">');
	        }
	
	        var droppable = false;
	
	        function dragEnter(el, event) {
	            droppable = null;
	            if (isDroppable()) {
	                event.preventDefault();
	                if (typeof vm.dndModel.dragEnter === 'function') {
	                    vm.dndModel.dragEnter(el);
	                } else if (vm.dndModel.debug) {
	                    $log.info('dndDroppable:  no "dragEnter(element)"   function in model: default to do-nothing');
	                }
	            }
	        }
	
	        function dragOver(event) {
	            if (isDroppable()) {
	                event.preventDefault();
	            }
	        }
	
	        function dragLeave(el) {
	            if (isDroppable()) {
	                if (typeof vm.dndModel.dragLeave === 'function') {
	                    vm.dndModel.dragLeave(el);
	                } else if (vm.dndModel.debug) {
	                    $log.info('dndDroppable:  no "dragLeave(element)"   function in model: default to do-nothing');
	                }
	            }
	        }
	
	        function dragDrop(event) {
	            if (isDroppable()) {
	                event.preventDefault();
	                var data = dndData.getData();
	                dndData.dropData();
	                if (typeof vm.dndModel.dragDrop === 'function') {
	                    vm.dndModel.dragDrop(data);
	                } else if (vm.dndModel.debug) {
	                    $log.info('dndDroppable:  no "dragDrop(data)"       function in model: default to do-nothing');
	                }
	            }
	        }
	
	        function isDroppable() {
	            if (droppable === null) {
	                if (!dndData.isDragging()) {
	                    droppable = false;
	                } else if (typeof vm.dndModel.isDroppable === 'function') {
	                    droppable = vm.dndModel.isDroppable(dndData.getData());
	                } else {
	                    if (vm.dndModel.debug) {
	                        $log.info('dndDroppable:  no "isDroppable(data)"    function in model: default to true');
	                    }
	                    droppable  = true;
	                }
	            }
	            return droppable;
	        }
	    }
	
	    function linker(scope, el, attrs, vm) {
	
	        var inCount = 0;
	        var promise;
	
	        // listen to drag-related events...
	
	        el.on('dragenter', function (event) {
	            inCount++;
	            if (inCount === 1) {
	                vm.dragEnter(el, event);
	            }
	        });
	
	        el.on('dragleave', function () {
	            inCount--;
	            if (inCount === 0) {
	                $timeout.cancel(promise);
	                vm.dragLeave(el);
	            } else {
	                monitorDragOvers();
	            }
	        });
	
	        el.on('drop', function (event) {
	            vm.dragDrop(event);
	            vm.dragLeave(el);
	
	            inCount = 0;
	        });
	
	        el.on('dragover', function (event) {
	            $timeout.cancel(promise);
	            vm.dragOver(event);
	        });
	
	        function monitorDragOvers() {
	            $timeout.cancel(promise);//cancel before overwriting
	            promise = $timeout(function() {
	                vm.dragLeave(el);
	                inCount = 0;
	            }, (500));
	        }
	    }
	}

})();