(function () {
    /**
     * 这是实现了JS面对对象的核心。
     * 实现了面对对象的private、public、super、self。
     * 在方法中，使用$super,$self进行调用。
     * 使用_来定义private（我也想用private啊-.=）
     * 其他的，看GitHub上的例子吧。
     * https://github.com/MorningZheng/jsOOO-private-public-support-
     * 最后，引用的时候，请写上作者，谢谢了。
     * ===@copyright ZhengChen 20180411 QQ:99713366 Email:vsystem@126.com===
     */
    var $dock;
    var $browser=(function () {
        try{
            $dock=window;
            //判断IE浏览器版本
            $dock['$ie']=(function () {
                var b = document.createElement('b');
                for(var i=6;i<12;i++){
                    b.innerHTML = '<!--[if IE '+i+']><i></i><![endif]-->';
                    if(b.getElementsByTagName('i').length === 1){
                        return i;
                        break;
                    };
                };
                return -1;
            })();

            return true;
        } catch (_){
            $dock=global;
            return false;
        };
    })();

    if($dock.$package instanceof Function)return true;

    (function () {
        'use strict';
        var $callee=undefined;
        var $scope=undefined;
        var $index=-1;

        var KEY_ANONYMOUS='anonymous';
        var KEY_SCOPE='^_^scope';
        var KEY_PROTO='@-prototype';

        var $var=(function () {
            var $={'_':'private','$':'protected','#':'static'};
            return function (name) {
                if(name.substr(0,2)==='__')return 'public';
                name=name.substr(0,1);//比如__是要弄出来的
                return $.hasOwnProperty(name)?$[name]:'public';
            }
        })();

        var $proxy=(function () {
            var $fix=function (args) {
                while (args.length<$callee.length) Array.prototype.push.call(args,undefined);
                return args;
            };

            return {
                'object':{
                    handler:function (structure,name,key,args) {
                        var _scope=$scope;
                        //所有的实例一定继承至某个父，有KEY_PROTO是属性，并且入口都在最上层
                        if(this instanceof structure.factory && this.hasOwnProperty(KEY_PROTO)===false)$dock['$this']=$scope=this;

                        var _super=$dock.$super;
                        $dock.$super=$dock.$parent=structure.super;

                        var _self=$dock.$self;
                        $dock.$self=structure.factory;

                        var _callee=$callee;
                        $callee=structure.chain[$index].property1[name][key];

                        try{
                            //切换作用域
                            return $callee.apply($scope,$fix(args));
                        }finally {
                            $dock['$this']=$scope=_scope;
                            $dock.$super=$dock.$parent=_super;
                            $dock.$self=_self;
                            $callee=_callee;
                        };
                    },
                    'public':function (structure,name,key) {
                        return structure.property2[name][key]=function () {
                            var _index=$index;
                            $index=structure.chainIndex;

                            try{
                                return $proxy.object.handler.call(this,structure,name,key,arguments);
                            }finally {
                                $index=_index;
                            };
                        };
                    },
                    'private':function (structure,name,key) {
                        return structure.property2[name][key]=function () {
                            if($index===-1)throw new Error('从在外部访问了一个私有的方法：'+structure.package+'.'+name+'。');
                            if(!structure.chain[$index] || !structure.chain[$index].property1[name])throw new Error('访问了一个不在本类上的私有方法：'+structure.package+'.'+name+'。');

                            return $proxy.object.handler.call(this,structure,name,key,arguments);
                        };
                    },
                    'protected':function (structure,name,key) {
                        return structure.property2[name][key]=function () {
                            if($index===-1)throw new Error('从在外部访问了一个受保护的方法：'+structure.package+'.'+name+'。');
                            var _index=$index;
                            $index=structure.chainIndex;

                            try{
                                return $proxy.object.handler.call(this,structure,name,key,arguments);
                            }finally {
                                $index=_index;
                            };
                        };
                    },
                    value:function (structure,name,type) {
                        //这里只做转换，不涉及空间变化
                        structure.property1[name].data=structure.property1[name].val=structure.property1[name].value;
                        delete structure.property1[name].value;
                        delete structure.property1[name].writable;

                        if(structure.property1[name].data instanceof Function){
                            structure.property1[name].data=$proxy.object[type](structure,name,'val');
                            structure.property1[name].data.toString=function () {
                                return structure.property1[name].val.toString();
                            };
                        };

                        structure.property1[name].get=function () {
                            return $scope[KEY_SCOPE][$index].hasOwnProperty(name)?$scope[KEY_SCOPE][$index][name]:structure.property1[name].data;
                        };

                        structure.property1[name].set=function (newVal) {
                            $scope[KEY_SCOPE][$index][name]=newVal;
                        };
                    },
                    get:function (structure,name,type) {
                        if(structure.property1[name].set && !structure.property1[name].get)structure.property1[name].get=function () {
                            throw new Error('对只读属性：'+structure.package+'.'+name+' 取值失败。');
                        };
                        $proxy.object[type](structure,name,'get');
                    },
                    set:function (structure,name,type) {
                        if(structure.property1[name].get && !structure.property1[name].set)structure.property1[name].set=function () {
                            throw new Error('对只读属性：'+structure.package+'.'+name+' 赋值失败。');
                        };
                        $proxy.object[type](structure,name,'set');
                    },
                },
                'static':{
                    handler:function (structure,name,key,args) {
                        var _self=$dock.$self;
                        $dock.$self=structure.factory;

                        var _callee=$callee
                        $callee=structure.method1[name][key];

                        try{
                            //切换作用域
                            return $callee.apply($scope,$fix(args));
                        }finally {
                            $dock.$self=_self;
                            $callee=_callee;
                        };
                    },
                    'public':function (structure,name,key) {
                        return structure.method2[name][key]=function () {
                            var _index=$index;
                            $index=structure.chainIndex;
                            try{
                                return $proxy.static.handler.call(this,structure,name,key,arguments);
                            }finally {
                                $index=_index;
                            };
                        };
                    },
                    'private':function (structure,name,key) {
                        return structure.method2[name][key]=function () {
                            if($index===-1)throw new Error('从在外部访问了一个私有的方法：'+structure.package+'.'+name+'。');
                            return $proxy.static.handler.call(this,structure,name,key,arguments);
                        };
                    },
                    'protected':function (structure,name,key) {
                        return structure.method2[name][key]=function () {
                            if($index===-1)throw new Error('从在外部访问了一个受保护的方法：'+structure.package+'.'+name+'。');
                            var _index=$index;
                            $index=structure.chainIndex;
                            try{
                                return $proxy.static.handler.call(this,structure,name,key,arguments);
                            }finally {
                                $index=_index;
                            };
                        };
                    },
                    value:function (structure,name,type) {
                        structure.method1[name].data=structure.method1[name].val=structure.method1[name].value;
                        delete structure.method1[name].value;
                        delete structure.method1[name].writable;

                        if(structure.method1[name].data instanceof Function){
                            structure.method1[name].data=$proxy.static[type](structure,name,'val');
                            structure.method1[name].data.toString=function () {
                                return structure.method1[name].val.toString();
                            };
                        };

                        structure.method1[name].get=function () {
                            return structure.method1[name].data;
                        };

                        structure.method1[name].set=function (newVal) {
                            structure.method1[name].data=newVal;
                        };

                        return structure;
                    },
                    get:function (structure,name,type) {
                        if(structure.method1[name].set && !structure.method1[name].get)structure.method1[name].get=function () {
                            throw new Error('对只读属性：'+structure.package+'.'+name+' 取值失败。');
                        };
                        $proxy.static[type](structure,name,'get');
                    },
                    set:function (structure,name,type) {
                        if(structure.method1[name].get && !structure.method1[name].set)structure.method1[name].set=function () {
                            throw new Error('对只读属性：'+structure.package+'.'+name+' 赋值失败。');
                        };
                        $proxy.static[type](structure,name,'set');
                    },
                },
            };
        })();

        var $factory=(function () {
            var $initializing=false;
            $dock['$this']=$dock['$super']=$dock['$parent']=$dock['$self']=undefined;

            var $config=function (scope,structure,args) {
                if(scope instanceof structure.factory){
                    if(structure.initialized===false){
                        var _initializing=$initializing;
                        $initializing=true;

                        //初始化
                        structure.chain=[];
                        structure.property1={};
                        structure.property2={};

                        //继承的实现
                        if(structure.parent){
                            structure.factory.prototype=new structure.parent();
                            structure.factory.prototype.constructor=structure.factory;
                            structure.super=structure.parent.prototype;
                            Array.prototype.push.apply(structure.chain,structure.parent.__GLOBAL__.chain);
                        }else structure.super={};
                        structure.factory.prototype[KEY_PROTO]=true;

                        //缓存数据结果，减少计算
                        structure.chainIndex=structure.chain.length;
                        structure.chain.push(structure);

                        //属性解包
                        structure.property.construct=structure.construct;
                        for(var p in structure.property){
                            structure.property2[p]={};
                            var t=$var(p);
                            structure.property1[p]=Object.getOwnPropertyDescriptor(structure.property,p);

                            //将value转换成getter/setter
                            if(structure.property1[p].hasOwnProperty('value'))$proxy.object.value(structure,p,t);

                            $proxy.object.get(structure,p,t);
                            $proxy.object.set(structure,p,t);
                        };
                        //设置
                        Object.defineProperties(structure.factory.prototype,structure.property2);

                        structure.initialized=true;
                        scope=new structure.factory();
                        $initializing=_initializing;
                    };

                    //应用
                    if($initializing===false){
                        scope[KEY_SCOPE]=[];
                        while (scope[KEY_SCOPE].length<structure.chain.length)scope[KEY_SCOPE].push({});
                        return scope.construct.apply(scope,args)||scope;
                    }else return scope;

                }else{
                    if(structure.initialized===false)Array.prototype.forEach.call(args,function (a) {
                        if(a instanceof Object) structure.property=a;
                        if(a instanceof Function) structure.construct=a;
                    });
                    return structure.factory;
                };
            };
            var $empty={
                property:{},
                construct:function () {
                    return this;
                },
            };
            return function ($path,$name,$property,$parent) {
                var $={
                    initialized:false,
                    name:$name,
                    path:$path,
                    pathArray:$path.split('.').reduce(function (a,p) {
                        p=p.trim();
                        if(p)a.push(p);
                        return a;
                    },[]),
                    'package':$path+'::'+$name,
                    parent:$parent,
                    property:$property||$empty.property,
                    construct:$empty.construct,
                };
                $.toStringData='[class '+$.package+']';

                $.factory=(new Function('a','b','c',"return {'"+$.package+"':function () {return a(this===c?undefined:this,b,arguments);}}['"+$.package+"'];"))($config,$,$dock);
                $.factory.toString=function () {return $.toStringData;};
                $.factory.__GLOBAL__=$;

                return $;
            };
        })();

        $dock['$parameter']=function (args,rule) {
            if(args.hasOwnProperty('callee')===false) throw new Error('在应用'+$callee.toString()+'于时，参数1 args必须是arguments的引用。');
            if(rule)rule.split(',').forEach(function (v,k) {
                if(args[k]===undefined){
                    var s=v.indexOf('=');
                    if(s!==-1)args[k]=new Function('return '+v.substr(s+1))();
                };
            });
        };
        $dock['$bind']=function (methods) {
            if($scope){
                Array.prototype.forEach.call(arguments,function (m) {
                    if($scope[m] instanceof Function){
                        try{
                            $scope[m]=$scope[m].bind($scope);
                        }catch (_){};
                    };
                });
            };
        };

        var Singleton=$dock['$Singleton']={};

        var $package=$dock['$package']=function (path) {
            return $space(path||'local',Singleton,true);
        };

        var $space=(function () {
            var classHandler=function (name) {
                var $;
                if(this.data.hasOwnProperty(name)===false){
                    $=$factory(this.name,name);
                    $.factory.static=staticHandler;
                    $.factory.extends=extendsHandler;
                    if(this.name!==KEY_ANONYMOUS)this.data[name]=$;
                }else $=this.data[name];

                try{
                    return $.factory;
                }finally {
                    $=null;
                };
            };

            var staticHandler=function (method) {
                var space=this instanceof Function?this.__GLOBAL__:this;
                if(space.hasOwnProperty('static')===false){
                    space.method=method;
                    space.method1={};
                    space.method2={};
                    for(var m in method){
                        space.method2[m]={};
                        var t=$var(m);
                        space.method1[m]=Object.getOwnPropertyDescriptor(method,m);
                        if(space.method1[m].hasOwnProperty('value'))$proxy.static.value(space,m,t);
                        $proxy.static.get(space,m,t);
                        $proxy.static.set(space,m,t);
                    };
                    Object.defineProperties(space.factory,space.method2);
                };
                return space.factory;
            };

            var extendsHandler=function (parent) {
                var space=this instanceof Function?this.__GLOBAL__:this;
                if(parent && space.initialized===false){
                    if(parent instanceof Function) space.parent=parent;
                    else if(parent.constructor===String)space.parent=$import(parent);
                };
                return space.factory;
            };

            return function (dir,scope) {
                var create=arguments[2]?true:false;
                scope=scope||Singleton;

                if(dir==null)return;
                if(dir.constructor===String)dir=dir.split('.');
                dir=dir.reduce(function (a,d) {
                    d=d.trim();
                    if(d)a.push(d);
                    return a;
                },[]).join('.');

                if(scope.hasOwnProperty(dir)===false && create){
                    scope[dir]={
                        name:dir,
                        'class':classHandler,
                        data:{},
                    };
                };

                return scope[dir];
            };
        })();

        var $class=$dock['$class']=function (name) {
            return $package(KEY_ANONYMOUS).class(name);
        };

        var $import=$dock['$import']=(function () {
            var exist={};
            var task=[];
            var file=[];
            var loading=false;

            var requst,loader;
            if($browser){
                loader=new XMLHttpRequest();
                loader.onerror=function () {
                    load();
                };
                loader.onload=function () {
                    if(f.useBuffer===true) sessionStorage.setItem('jib'+requst,loader.responseText);
                    file.push(loader.responseText);
                    load();
                };
                var load=function () {
                    if(task.length){
                        requst=f.router(task[0],'js');
                        task.shift();

                        if(exist.hasOwnProperty(requst)===false){
                            if(f.useBuffer===true){
                                var b=sessionStorage.getItem('jib'+requst);//jsFlex import buffer
                                if(b){
                                    file.push(b);
                                    load();
                                    return;
                                };
                            };

                            exist[requst]=true;
                            loader.open('GET',requst);
                            loader.send();
                        }else load();
                    }else{
                        loading=false;
                        var js=file.concat();
                        file.length=0;
                        js.forEach(function (f) {
                            try{
                                (new Function(f))();
                            }catch(_){
                                console.log(f);
                                throw _;
                            };

                        });
                        file.length=0;

                        if(loading===false)$main('start');
                    };
                };
            }else{
                var load=function () {
                    if(task.length) {
                        requst = f.router(task[0], 'js');
                        require(requst);
                        load();
                    }else $main('start');
                };
            };

            var f=function (c) {
                c=c.split('.').reduce(function (a,v) {
                    v=v.trim();
                    if(v)a.push(v);
                    return a;
                },[]);
                var n=c.slice(-1);
                var p=c.slice(0,c.length-1);
                var i=$space(p,Singleton,false);
                var o=n==='*'?n:i?$space(n,i,false):i;

                try{
                    if(!o){
                        task.push(c);
                        if(loading===false){
                            loading=true;
                            setTimeout(load,0);
                        };
                        return $space(p,Singleton,true).class(n[0]);
                    }else if(n!=='*') return o.factory;
                }finally {
                    c=n=p=i=o=null;
                };
            };
            f.router=function (path,extend) {
                extend=extend||'js';
                if(extend==='js') return './'+path.slice(0,path.length-1).join('.')+'.'+extend;
                else if(extend==='css') return './'+path+'.'+extend;
            };
            f.useBuffer=false;
            Object.defineProperty(f,'running',{get:function () {return loading;}});


            return f;
        })();

        var $main=$dock['$main']=$dock['$ready']=(function () {
            var task=[];
            return function (f) {
                if(f==='start'){
                    task.forEach(function (t) {
                        t();
                    });
                    task.length=0;
                }else if(f instanceof Function){
                    task.push(f);
                };
            };
        })();

        var $callLater=$dock['$callLater']=(function () {
            var $worker=function () {
                var _=$list.concat();
                $list.length=0;
                $running=false;
                _.sort(function (a,b) {
                    if(a.priority<b.priority)return -1;
                    else if(a.priority>b.priority)return 1;
                    return 0;
                }).forEach(function ($) {
                    $.method.apply($,$.param);
                });
                _.length=0;
            };
            var $list=[];
            var $running=false;

            return function () {
                if(arguments.length===0)return;
                if($running===false){
                    $running=true;
                    setTimeout($worker,0);
                };

                var _={priority:0,method:null,param:[]};
                if(arguments[0].constructor===Number){
                    _.priority=arguments[0];
                };

                if(arguments[0] instanceof Function){
                    _.method=arguments[0];
                    _.param=_.param.slice.call(arguments,1);
                }else if(arguments[1] instanceof Function){
                    _.method=arguments[1];
                    _.param=_.param.slice.call(arguments,2);
                };

                if(_.method instanceof Function)$list.push(_);
            };
        })();

        var $css=$dock['$css']=function () {
            Array.prototype.forEach.call(arguments,function (f) {
                var $=document.createElement('link');
                $.setAttribute('href',$import.router(f,'css'));
                $.setAttribute('rel','stylesheet');
                $.setAttribute('type','text/css');
                document.head.appendChild($);
            });
        };
    })();
})(this);