### A decentralized framework for develop frontend and or backend realtime applications
- Incoming events path listen on .view.tsx .gateway.ts file types declaration
- No directory structure is required
- No main file is required
- As a frontend is a single page application
- As a backend is using message broker instead of http
- Hot module reloading for frontend and backend
- No public directory is required
- No disk cache in development mode
- Built in tailwind
- Frontend and backend compiled isolated
- Reactivity enabled for states and properties
- Method auto binding
- Images can by directly imported

### Frontend
#### View
- View decorator path route and auto instance
- Parameter decorator to extract route url parameter

```tsx
// example.view.tsx
import { View, Parameter } from 'riser'

@View( '/example' )
export class ExampleView {

  @Parameter( )
  name: string

  render( ) {
    return (
      <>{ this.name }</>
    )
  }

}
```

#### Component
- Component decorator to enable component
- onMount and onUnmount life cycles callbacks
- State decorator like useState without set method
- Property decorator like react props
- Children as render argument

```tsx
// example.component.tsx
import { Component, Property, State, Children } from 'riser'

@Component( )
export class ExampleComponent {

  onMount( ) {
    Logger( 'Mount Component!' )
  }

  onUnmount( ) {
    Logger( 'Unmount Component!' )
  }

  @State( )
  text: string

  @Property( )
  onClick: any

  render( children: Children ) {
    return (
      <>
        <ul>{ children }</ul>
        <input type='text' onChange={ ( event: any ) => { this.text = event.target.value } }/>
        <button onClick={ ( ) => this.onClick( this.text ) }>Send</button>
      </>
    )
  }

}
```

#### Layout
- Box
- Row
- Column

```tsx
// example.component.tsx
import { Box, Row, Column } from 'riser'

@Component( )
export class ExampleComponent {

  render( ) {
    return (
      <Box height='100%' width='100%'>
        <Row height='100%'>
          <Column width='30%'></Column>
          <Column width='70%'></Column>
        </Row>
      </Box>
    )
  }

}
```

#### Storage
- Storage decorator with auto instance

```typescript
// example.storage.ts
import { Storage } from 'riser'

@Storage( )
export class ExampleStorage {

  name: string
  email: string

}

// example.component.ts
import { Component, Inject } from 'riser'
import { ExampleStorage } from './example.storage.ts'

@Component( )
export class ExampleComponent {

  ...
  @Inject( )
  storage: ExampleStorage

  onMount( ) {
    this.storage.name = 'Example'
  }
  ...

}
```

#### Utility
- Navigate method for routing
- Subscribe decorator for websocket events callback
- Publish method websocket event send
- Observable decorator to share data between components
- Inject decorator for storage dependecy injection

```typescript
// example.view.tsx
import { View, Navigate, Subscribe, Publish, Logger, Inject } from 'riser'

@View( '/example' )
export class ExampleView {

  test: string

  @Observable( )
  myobserver: any

  onMount( ) {
    this.myobserver.subscribe( v => this.test = v )
    this.myobserver.publish( 'test' )
  }

  ...
  @Logger( 'in' )
  @Subscribe( '/example/read' )
  onRead( message: string ) {
    Publish( '/example/create', message )
    Navigate( '/another' )
  }
  ...

}
```

### Backend
#### Gateway
- Gateway decorator websocket auto instance with main path
- Request decorator websocket listen event callback with secondary path
- Response websocket method send to request client
- Broadcast websocket send event to multiple clients
- onBoot autoexecute method

```typescript
// example.gateway.ts
import { Gateway, Request, Response, Broadcast, Logger } from 'riser'

@Gateway( '/example' )
export class ExampleGateway {

  onBoot( ) {
    Logger( 'On Boot Example Gateway!' )
  }

  @Logger( 'out' )
  @Request( '/create' )
  onCreate( { client, message }: Request ): Response {
    Broadcast( '/example/read', [ client, 'user2' ], message )
    return Response( '/example/read', message )
  }

}
```

#### Service
- Service decorator auto instance
- Inject decorator for service dependecy injection

```typescript
// example.service.ts
import { Service } from 'riser'

@Service( )
export class ExampleService {
}

// example.gateway.ts
import { Gateway, Inject } from 'riser'
import { ExampleService } from './example.service.ts'

@Gateway( '/example' )
export class ExampleGateway {

  @Inject( )
  service: ExampleService

}
```

#### Guard
- Guard decorator auto instance
- Intercept decorator middleware event callback
- Expose decorator to expose gateway event callbacks from guard


```typescript
// example.guard.ts
import { Guard, Intercept } from 'riser'

@Guard( )
export class ExampleGuard {

  @Intercept( )
  onAuthorize( { client, path, message }: Request ) {
    return true
  }

}

// example.gateway.ts
import { Gateway, Expose, Request } from 'riser'

@Gateway( '/example' )
export class ExampleGateway {

  @Expose( )
  @Request( '/create' )
  onCreate( { client, message }: Request ): void {
  }

}
```

#### Utility
- Logger decorator optionally can log arguments and/or returns

```typescript
// example.gateway.ts
import { Gateway, Request, Response, Logger } from 'riser'

@Gateway( '/example' )
export class ExampleGateway {

  @Logger( )
  @Request( '/create' )
  onCreate( { client, message }: Request ): Response {
    return Response( '/example/read', message )
  }

}
```

#### Configuration

```js
// riser.config.js
module.exports = ( mode ) => {
  return {
    appname: 'test',
    development: {
      port: 3000
    },
    broker: {
      name: 'mqtt',
      host: 'localhost',
      port: 9001,
      username: 'root',
      password: 'root'
    }
  }
}
```

#### Future implementations
- Style sytem
- Mongodb odm layer