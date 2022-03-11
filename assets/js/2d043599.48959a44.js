"use strict";(self.webpackChunktd_doc=self.webpackChunktd_doc||[]).push([[3003],{3905:function(e,t,r){r.d(t,{Zo:function(){return c},kt:function(){return m}});var n=r(67294);function a(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function i(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function o(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?i(Object(r),!0).forEach((function(t){a(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):i(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function l(e,t){if(null==e)return{};var r,n,a=function(e,t){if(null==e)return{};var r,n,a={},i=Object.keys(e);for(n=0;n<i.length;n++)r=i[n],t.indexOf(r)>=0||(a[r]=e[r]);return a}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)r=i[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(a[r]=e[r])}return a}var u=n.createContext({}),s=function(e){var t=n.useContext(u),r=t;return e&&(r="function"==typeof e?e(t):o(o({},t),e)),r},c=function(e){var t=s(e.components);return n.createElement(u.Provider,{value:t},e.children)},p={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},d=n.forwardRef((function(e,t){var r=e.components,a=e.mdxType,i=e.originalType,u=e.parentName,c=l(e,["components","mdxType","originalType","parentName"]),d=s(r),m=a,f=d["".concat(u,".").concat(m)]||d[m]||p[m]||i;return r?n.createElement(f,o(o({ref:t},c),{},{components:r})):n.createElement(f,o({ref:t},c))}));function m(e,t){var r=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var i=r.length,o=new Array(i);o[0]=d;var l={};for(var u in t)hasOwnProperty.call(t,u)&&(l[u]=t[u]);l.originalType=e,l.mdxType="string"==typeof e?e:a,o[1]=l;for(var s=2;s<i;s++)o[s]=r[s];return n.createElement.apply(null,o)}return n.createElement.apply(null,r)}d.displayName="MDXCreateElement"},32265:function(e,t,r){r.r(t),r.d(t,{assets:function(){return c},contentTitle:function(){return u},default:function(){return m},frontMatter:function(){return l},metadata:function(){return s},toc:function(){return p}});var n=r(87462),a=r(63366),i=(r(67294),r(3905)),o=["components"],l={title:"Diff\xe9rences entre les bordereaux"},u=void 0,s={unversionedId:"reference/multi-bsd",id:"reference/multi-bsd",title:"Diff\xe9rences entre les bordereaux",description:"Le mode op\xe9ratoire de l'API pour les bordereaux DASRI, amiante, VHU et Fluides Frigorig\xe8nes diff\xe8re sensiblement de celui pour le BSDD.",source:"@site/docs/reference/multi-bsd.md",sourceDirName:"reference",slug:"/reference/multi-bsd",permalink:"/reference/multi-bsd",editUrl:"https://github.com/MTES-MCT/trackdechets/edit/dev/doc/docs/reference/multi-bsd.md",tags:[],version:"current",frontMatter:{title:"Diff\xe9rences entre les bordereaux"},sidebar:"docs",previous:{title:"BSDASRI",permalink:"/reference/statuts/bsdasri"},next:{title:"Environnements",permalink:"/reference/environments/"}},c={},p=[],d={toc:p};function m(e){var t=e.components,r=(0,a.Z)(e,o);return(0,i.kt)("wrapper",(0,n.Z)({},d,r,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("p",null,"Le mode op\xe9ratoire de l'API pour les bordereaux DASRI, amiante, VHU et Fluides Frigorig\xe8nes diff\xe8re sensiblement de celui pour le BSDD."),(0,i.kt)("p",null,"le champ ",(0,i.kt)("inlineCode",{parentName:"p"},"id")," stocke un champ lisible (\xe9quivalent du ",(0,i.kt)("inlineCode",{parentName:"p"},"readableId")," du bsdd). Il n'y a donc pas de champ ",(0,i.kt)("inlineCode",{parentName:"p"},"readableId"),".\nLe ",(0,i.kt)("inlineCode",{parentName:"p"},"DRAFT")," est sorti des statuts, c'est un boolean \xe0 part. Le passage par l'\xe9tape brouillon est facultatif."),(0,i.kt)("p",null,"Pour donner plus de flexibilit\xe9 et limiter les mutations, les principes suivants sont adopt\xe9s:"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},"le nombre de mutations est reduit: ",(0,i.kt)("inlineCode",{parentName:"li"},"create/createDraft"),", ",(0,i.kt)("inlineCode",{parentName:"li"},"publish"),", ",(0,i.kt)("inlineCode",{parentName:"li"},"update"),", ",(0,i.kt)("inlineCode",{parentName:"li"},"sign")),(0,i.kt)("li",{parentName:"ul"},"createDraft cr\xe9e un bordereau dans l'\xe9tat ",(0,i.kt)("inlineCode",{parentName:"li"},"INITIAL"),", ",(0,i.kt)("inlineCode",{parentName:"li"},"isDraft=true"),". Cette mutation est optionelle, on peut commencer avec ",(0,i.kt)("inlineCode",{parentName:"li"},"create")),(0,i.kt)("li",{parentName:"ul"},"create cr\xe9e un bordereau dans l'\xe9tat ",(0,i.kt)("inlineCode",{parentName:"li"},"INITIAL"),", ",(0,i.kt)("inlineCode",{parentName:"li"},"isDraft=false")),(0,i.kt)("li",{parentName:"ul"},"publish passe le bordereau de ",(0,i.kt)("inlineCode",{parentName:"li"},"isDraft=true")," \xe0 ",(0,i.kt)("inlineCode",{parentName:"li"},"isDraft=false")),(0,i.kt)("li",{parentName:"ul"},"la mutation update permet de mettre \xe0 jour le bordereau pendant son cycle de vie"),(0,i.kt)("li",{parentName:"ul"},"la mutation sign (EMISSION, TRANSPORT, RECPTION, OPERATION) appose une signature sur le cadre correspondant et verrouille les champs correspondants"),(0,i.kt)("li",{parentName:"ul"},"une fois qu'une signature est appos\xe9e, les champs du cadre correspondant ne sont plus modifiables")))}m.isMDXComponent=!0}}]);