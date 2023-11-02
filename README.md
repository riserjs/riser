### A decentralized framework for develop frontend and/or backend realtime applications
- Incoming events path listen on .view.tsx .gateway.ts file types declaration.
- No directory structure is required.
- No main file is required.
- As a frontend, is a single page application.
- Hot module reloading for frontend and backend.

### Frontend
#### View
- View decorator path route and auto instance
- Parameter decorator to extract url parameter

#### Component
- Method auto binding
- Re rendering enabled for states changes
- Initiate event like useEffect hook
- State decorator like useState without set method
- Property decorator like react props
- Children as render argument

#### Utility
- Navigate method for routing
- Receptor decorator for websocket events callback
- Emitter method gateway event send

### Backend
#### Gateway
- Gateway decorator websocket auto instance with main path
- Request decorator websocket listen event callback with secondary path
- Response websocket method send to request client
- Broadcast websocket global event send

#### Database
- Database decorator auto instance
- Initiate decorator autoexecute method

#### Guard
- Guard decorator auto instance
- Intercept decorator middleware event callback
- Expose decorator to expose gateway event callbacks from guard

#### Utility
- Logger decorator optionally can log arguments and/or returns

#### Future implementations
- Config file
- Mail sender in backend as jsx
- Layout shared to avoid rerendering on routing
- Styled themes
- Object type for state

### Frontend
#### View

```typescript
// home.view.tsx
import { View, Navigator, Request } from 'riser'
import { ButtonComponent } from './button.component'

@View( '/' )
export class HomeView {

  render( ) {
    return (
      <>
        <ButtonComponent label={ 'Go to message!' } onClick={ () => Navigator( '/message' ) }/>
        <ButtonComponent label={ 'Go to message with params' } onClick={ () => Navigator( '/message?height=200&width=300' ) }/>
        <ButtonComponent label={ 'Check endpoint authorization!' } onClick={ () => Request( '/account/create', { a: 1 } ) }/>
      </>
    )
  }

}
```

```typescript
// message.view.tsx
import { View, Navigate, Parameter } from 'riser'
import { ButtonComponent } from './button.component'
import { ChatComponent } from './chat.component'

@View( '/message' )
export class MessageView {

  @Parameter()
  height: number

  @Parameter()
  width: number

  render( ) {
    return (
      <>
        <ButtonComponent label={ 'Go to home!' } onClick={ () => Navigate( '/' ) }/>	
        <ChatComponent/>
        {this.height} {this.width}
      </>
    )
  }

}
```

#### Component 

```typescript
// chat.component.tsx
import { Component, State, Receptor, Emitter } from 'riser'

@Component()
export class ChatComponent {

  @State()
  messages: String[] = [ ]

  @Receptor( '/message/read' )
  onRead( message: String ) {
    this.messages.unshift( message )
  }

  onCreate( ) {
    Emitter( '/message/create', this.input )
    this.input = ''
  }

  input: String

  render( ) {
    return (
      <>
        <ul class="m-4 mt-0 list-none list-inside text-blue-dark border w-[363px] h-[100px] overflow-auto rounded">
          { this.messages.map( ( m: any ) => <li>{ m }</li> ) }
        </ul>
        <div class="flex m-4">
          <input
            type="text"
            placeholder="Write Here!"
            class="py-2 px-2 text-md border focus:outline-none rounded"
            onKeyUp={ ( e: any ) => this.input = e.target.value }
          />
          <button
            class="ml-4 w-20 flex items-center justify-center border rounded text-blue-dark"
            onClick={this.onCreate}
          >Send
          </button>
        </div>
      </>
    )
  }

}
```

```typescript
// button.component.tsx
import { Component, Property } from 'riser'

@Component()
export class ButtonComponent {

  @Property()
  label: string

  @Property()
  onClick: any

  render( ) {
    return (
      <button class="m-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={this.onClick}>
        {this.label}
      </button>
    )
  }

}
```

### Backend
#### Gateway

```typescript
// user.gateway.ts
import { Gateway, Request, Reaponse } from 'riser'

@Gateway( '/user' )
export class UserGateway {

  @Request( '/create' )
  onCreate( message: any ): Response {
    return Response( '/user/read', message )
  }

}
```

```typescript
// message.gateway.ts
import { Gateway, Request, Broadcast, Logger, Expose } from 'riser'

@Gateway( '/message' )
export class MessageGateway {

  @Expose( )
  @Logger( )
  @Request( '/create' )
  onCreate( message: any ) {
    Broadcast( '/message/read', message )
  }

}

```

#### Database

```typescript
// mongodb.database.ts
import { Database, Initiate } from 'riser'

@Database( )
export class MongodbDatabase {

  @Initiate()
  connect() {
    // database connection
  }

}
```

#### Guard

```typescript
// authorization.guard.ts
import { Guard, Intercept, Logger } from 'riser'

@Guard( )
export class AuthorizationGuard {

  @Logger( )
  @Intercept( )
  onAuthorize( { path, data }: any ) {
    return false
  }

}
```