# jsOOP(jsFlex核心)
 
###### jsOOP扩展了ecamscript5面对对象的能力，它通过链式调用，让你能够使用其他高级语言中的class大部分特性！

##### 使用方式：

浏览器：

```
<script type="text/javascript" charset="UTF-8" src="core.js"></script>
```
nodejs：

```
require('core.js');
```

看例子：


```
var A=$package('local')//定义包路径
    .class('A')//定义类名称
    (
        //构造函数
        function(){
            console.log('a',$this);
        },
        //定义方法及属性
        {
            _states:-1,
            get states(){
                return this._states;
            },
            set states(value){
                this._states = value;//调用私有属性
            },
        }
    );

var B=$class('B')//定义一个匿名类
    .extends(A)//继承至A
    .static({//静态方法
        a:function () {//共有方法
            return $self._b;//$self指向自身
        },
        get _b() {//_开头的名称，用于定义private
            return ($self===B);
        },
    })(
        function(){
            console.log('b',$super);
        },
        {
            states:function () {//override复写函数
                return $super.states+1;//调用父类
            },
        }
    );
```


```
$ready(function () {
    var _1=new A();
    var _2=new B();

    console.log(_2 instanceof A);
    <!--输出：true-->
    
    console.log(_1.states(),_2.states());
    <!--输出： 0,1-->
});
```


##### API
##### 1. $package
 1.1 class
 
 1.2 extends
 
 1.3 static
 
 1.4 contrcut
 
 1.5 property
##### 2. $class
##### 3. private/public/protected
##### 4. $parameter
##### 5. $bind
##### 6. $Singleton
6.1 replace 
##### 7. $import
7.1 router

7.2 useBuffer<default:false>
##### 8. $ready
##### 9. $callLater
##### 10. $css

### 2018-05-01后更新API文档
### API document will update at 2018-05-01
