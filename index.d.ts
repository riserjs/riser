declare global {
  var jsx: any
  var views: any
  var router: any
	var emitter: any
	var receptor: any
  var update: any
  var subscribe: any
  var publish: any
}

declare module 'quartzjs' {
  export function Gateway( path: string )
  export function Request( path: string )
  export interface Response { path: string, message: any }
  export function Response ( path: string, message: any )
  export function Broadcast( path: string, message: any )
  export function Database( )
  export function Logger( value?: any )
  export function Guard( )
  export function Intercept( )
  export function Expose( )
  export function View( path: string )
  export function Component( )
  export function Initiate( )
  export function Navigate( path: string )
  export function Emitter( path: string, message: any )
  export function Receptor( path: string )
  export function State( )
  export function Parameter( )
  export function Property( )
}

namespace JSX {
  interface IntrinsicElements {
    a: any;
    abbr: any;
    address: any;
    area: any;
    article: any;
    aside: any;
    audio: any
    b: any;
    base: any
    bdi: any;
    bdo: any;
    big: any;
    blockquote: any;
    body: any;
    br: any;
    button: any;
    canvas: any;
    caption: any;
    center: any;
    cite: any;
    code: any;
    col: any;
    colgroup: any;
    data: any;
    datalist: any;
    dd: any;
    del: any;
    details: any;
    dfn: any;
    dialog: any;
    div: any;
    dl: any;
    dt: any;
    em: any;
    embed: any;
    fieldset: any;
    figcaption: any;
    figure: any;
    footer: any;
    form: any;
    h1: any;
    h2: any;
    h3: any;
    h4:any;
    h5: any;
    h6: any;
    head: any;
    header: any;
    hgroup: any;
    hr: any;
    html: any;
    i: any;
    iframe: any;
    img:any;
    input: any;
    ins: any;
    kbd: any;
    keygen:any;
    label:any;
    legend: any;
    li:any;
    link: any;
    main: any;
    map: any;
    mark: any;
    menu: any;
    menuitem: any;
    meta: any;
    meter: any;
    nav: any;
    noindex: any;
    noscript: any;
    object: any;
    ol: any;
    optgroup: any;
    option: any;
    output: any;
    p: any;
    param: any;
    picture: any;
    pre: any;
    progress: any;
    q: any;
    rp: any;
    rt: any;
    ruby: any;
    s: any;
    samp: any;
    slot:any;
    script:any;
    section: any;
    select: any;
    small: any;
    source:any;
    span: any;
    strong: any;
    style: any;
    sub: any;
    summary: any;
    sup: any;
    table: any;
    template: any;
    tbody: any;
    td: any;
    textarea: any;
    tfoot: any;
    th:any;
    thead: any;
    time: any;
    title: any;
    tr: any;
    track: any;
    u: any;
    ul: any;
    'var': any;
    video: any;
    wbr: any;
    webview: any;
  }
}

declare module '*.png'
declare module '*.svg'
declare module '*.jpeg'
declare module '*.jpg'

interface String { q }
interface Number { q }
interface Boolean { q }
interface Array { q, isEmpty }
interface Object { q, isEmpty }


//interface Object extends Object { map?: any }

/*Object.prototype.map = function( callback: any ) {
	return Object.entries( this ).map( ( v ) => callback( v[0], v[1] ) )
}*/

/*Number.prototype.format = (): string => {}*/
