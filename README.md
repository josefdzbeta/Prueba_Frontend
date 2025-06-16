# Event Reservation System

A modern Angular application for event booking and ticket reservation, built with performance and user experience in mind.

## Features

- 📅 Browse available events with details
- 🎫 Select and manage event sessions
- 🛒 Shopping cart functionality with local storage persistence
- 🔍 Detailed event view with session availability
- ⚡ Optimized performance with OnPush change detection

## Technical Stack

- Angular 17+
- TypeScript
- RxJS for reactive state management
- Local Storage for cart persistence
- SCSS for styling

## Project Structure

```
event-reservation/
├── src/
│   ├── app/
│   │   ├── core/           # Core services and utilities
│   │   ├── features/       # Feature modules
│   │   └── shared/         # Shared components and models
│   ├── assets/
│   │   └── data/          # Mock JSON data
│   └── styles/            # Global styles
```

## Getting Started

1. Clone the repository:

```bash
git clone [repository-url]
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
ng serve
```

4. Open your browser and navigate to `http://localhost:4200`

## Development

### Code Organization

- **Core Module**: Contains essential services like `EventService`
- **Feature Modules**: Contains main features like event list and details
- **Shared Module**: Reusable components, models, and services

### Key Components

- `EventList`: Displays grid of available events
- `EventDetail`: Shows detailed event information and session selection
- `ShoppingCart`: Manages cart state and user selections

### Services

- `EventService`: Handles event data fetching and transformation
- `CartService`: Manages shopping cart state and persistence

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running Tests

```bash
ng test
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

[MIT License](LICENSE)
