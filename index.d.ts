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

declare module 'riser' {
  export function Gateway( path: string )
  export function Request( path: string )
  export function Response( path: string, message: any )
  export function Broadcast( { clients, path, message }: any )
  export function Service( )
  export function Storage( )
  export function Inject( options: any )
  export function Logger( value?: any )
  export function Guard( )
  export function Intercept( )
  export function Expose( )
  export function View( path: string )
  export function Component( )
  export function Navigate( path: string )
  export function Publish( path: string, message: any )
  export function Subscribe( path: string )
  export function State( )
  export function Parameter( )
  export function Property( )
  export function Client( value: string )
  export function Observable( )
  export type Request = { client: string, path: string, message: any }
  export type Response = { path: string, message: any }
  export type Children = HTMLElement[]
  interface Observable < TYPE > {
    value: TYPE
    subscriptions: any
    subscribe: ( v ) => void 
    publish: ( v ) => void 
  }
}

declare module 'riser/interface' {
  export function Button( data: any )
  export function Input( data: any )
  export function Box( data: any )
  export function Row( data: any )
  export function Column( data: any )
}

declare module 'riser/database' {
  export function Schema( name: string )
  export function Field( options?: any )
  export interface Model < T > {
    async create( query: any )
    async read( query: any, all?: boolean )
    async readAll( query: any, values: any )
    async update( query: any, values: any )
    async updateAll( query: any, values: any )
    async delete( query: any )
  }
}

declare module '*.png'
declare module '*.svg'
declare module '*.jpeg'
declare module '*.jpg'

//interface Object extends Object { map?: any }

/*Object.prototype.map = function( callback: any ) {
	return Object.entries( this ).map( ( v ) => callback( v[0], v[1] ) )
}*/

/*Number.prototype.format = (): string => {}*/

//Object.defineProperty( Array.prototype, 'isEmpty', { value: () => Array.prototype.length == 0 ? false : true } )
//Object.defineProperty( Object.prototype, 'isEmpty', { value: () => Object.keys( Object.prototype ).length == 0 ? false : true } )

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