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
- Reactivity enabled for states
- Method auto binding
- Images can by directly imported

### Frontend
#### View
- View decorator path route and auto instance
- Parameter decorator to extract route url parameter

```typescript
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
- Initiate event like useEffect hook
- State decorator like useState without set method
- Property decorator like react props
- Children as render argument

```typescript
import { Component, Property, State, Initiate, Children } from 'riser'

@Component( )
export class ExampleComponent {

  @State( )
  text: string

  @Property( )
  onClick: any

  @Initiate( )
  onInit( ) {
    Logger( 'Example Component!' )
  }

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

#### Utility
- Navigate method for routing
- Subscribe decorator for websocket events callback
- Publish method websocket event send

```typescript
import { View, Navigate, Subscribe, Publish, Logger } from 'riser'

@View( '/example' )
export class ExampleView {

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

```typescript
import { Gateway, Request, Response, Broadcast, Logger } from 'riser'

@Gateway( '/example' )
export class ExampleGateway {

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
- Initiate autoexecute method

```typescript
import { Gateway, Inject } from 'riser'
import { ExampleService } from './example.service.ts'

@Gateway( '/example' )
export class ExampleGateway {

  @Inject( )
  service: ExampleService

}

import { Service, Initiate } from 'riser'

@Service( )
export class ExampleService {

  @Boot( )
  connect( ) {
    // handle database connection
  }

}
```

#### Guard
- Guard decorator auto instance
- Intercept decorator middleware event callback
- Expose decorator to expose gateway event callbacks from guard


```typescript
import { Gateway, Expose, Request } from 'riser'

@Gateway( '/example' )
export class ExampleGateway {

  @Expose( )
  @Request( '/create' )
  onCreate( { client, message }: Request ): void {
  }

}

import { Guard, Intercept } from 'riser'

@Guard( )
export class ExampleGuard {

  @Intercept( )
  onAuthorize( { client, path, message }: Request ) {
    return true
  }

}
```

#### Utility
- Logger decorator optionally can log arguments and/or returns

```typescript
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
- Config file

```json
{
  "appname": "example",
  "development": {
    "port": 3000
  },
  "broker": {
    "name": "mqtt",
    "host": "localhost",
    "port": 9001,
    "username": "root",
    "password": "root"
  }
}
```

#### Future implementations
- Layout shared to avoid rerendering on routing
- Styled themes
