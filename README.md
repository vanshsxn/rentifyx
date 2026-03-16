# RentifyXRentifyX is a web-based application designed to facilitate the search and management of student housing,specifically focusing on Paying Guest (PG) and flat rentals. 
The system provides a centralized platform for three distinct user roles: Tenants, Landlords, and Administrators.
# 1. System ArchitectureThe application is built using a decoupled architecture:
Frontend: Developed using the React library for user interface management.
Backend: Built with Java (Spring Boot) to handle business logic and database operations.
Database: Utilizes MySQL for relational data storage including user profiles and property listings.
# 2. Functional Components
2.1 Tenant ModuleSearch and Filter: Users can browse available listings based on parameters such as geographical area and price range.Slide-to-Request: A verification gesture implemented to confirm user interest and prevent accidental data submissions.Budget Analysis: A utility that calculates a 40/30/30 income distribution for financial planning.
2.2 Landlord ModuleListing Management: Tools to add, update, or remove property data from the system.Privacy Controls: Tenant contact information is restricted and only becomes visible after the landlord formally accepts a digital request.
2.3 Administrative ModuleSystem Oversight: Monitoring of user activities and manual removal of invalid listings.Data Analytics: Visualization of average rent trends and high-demand locations.
# 3. Technical ImplementationThe system incorporates several computer science concepts to improve performance and security:
Hashing: Used for identifying duplicate property listings in $O(1)$ time complexity.Max Heaps: Employed in the backend to rank properties based on user-submitted ratings.
Input Validation: Verification of rental prices against local averages to identify potential fraudulent entries.
# 4. DevelopmentThe project was developed by MV Studios Japan.
Lead Developer: Vansh Saxena
Project URL: rentifyx