# Getting the distinction between an **Account** and a **Profile** correct is the most critical element for the site's personalization features to work as intended

Here is the detailed writeup explaining the authentication process, the Account/Profile structure, and how the database tables are utilized to create this experience.

***

## **Part 1: The Authentication & Profile Selection Flow (The User's Journey)**

The entire process is designed to separate the act of *gaining access* (authentication at the Account level) from the act of *using the site* (personalization at the Profile level).

1. **The Login (Account Level Authentication)**
    A user from a subscribed pharmacy arrives at the login page. They enter a single, shared set of credentials (e.g., `manager@bestpharmacy.com` and a password). When they click "Login," the system authenticates them against the **`accounts`** table in the database. This confirms they are a valid, paying subscriber and grants them access to the members-only area.

2. **Protected Routing & The Profile Selector**
    Immediately upon successful authentication, the user is redirected to the member dashboard. Before the dashboard content is fully usable, a modal or lightbox appears, overlaying the page. This is the **Profile Selector**.

    This modal performs a critical function: it forces the user to declare *who* is using the shared account at that moment. The modal will:
    * Display a dropdown menu populated with the names of all individuals associated with that account.
    * Offer a button to "Create a New Profile."

3. **The Active Session (Profile Level Personalization)**
    Once a user selects a Profile (e.g., "Jane Doe, PharmD") or creates a new one, the Profile Selector modal closes. At this moment, the website's front-end state is updated to set the **Active Profile**. From this point on, all actions that require personalization—such as bookmarking a resource or tracking video progress—are explicitly tied to this Active Profile, not the overarching Account.

    If another team member wants to use the site, they don't need to log out. They simply re-open the Profile Selector from a user menu in the site's header and switch to their own Profile, instantly loading their personalized settings.

## **Part 2: The Technical Architecture & Data Model**

This "Netflix model" is powered by a clear separation of concerns in both the front-end state management and the back-end database structure.

### **Front-End State Management**

The application will maintain two distinct, critical pieces of state:

* **`accountState`**: This is set once upon successful login. It contains the authenticated user's `account_id` and subscription status. This state governs whether the user can access the members-only area at all.
* **`profileState`**: This is set or changed whenever a user selects a profile from the Profile Selector. It contains the active `profile_id`, the user's name, and their role. This state governs all personalization features.

Event handlers will be tied to both: one for the initial login to fetch account and profile data, and another for the profile selection to update the UI and fetch profile-specific data like bookmarks and training progress.

### **Database Table Utilization**

1. **`accounts` Table**
    * **Purpose**: This is the "household" or the authenticated entity. It represents the entire pharmacy subscription.
    * **Key Columns**:
        * `id`: The unique identifier for the pharmacy's account. This is the primary key.
        * `email`: The username used for logging in.
        * `subscription_status`: Determines if the account has access to member content (`'active'`).

2. **`member_profiles` Table**
    * **Purpose**: This table holds the individual "user profiles" within an account.
    * **Key Columns**:
        * `id`: The unique identifier for the individual person. This is the primary key for all personalization.
        * `member_account_id`: This is the crucial **foreign key** that links each profile back to a single row in the `accounts` table. It answers the question, "Which pharmacy does this person belong to?"
        * `first_name`, `last_name`, `profile_role`: Used to display the person's identity in the Profile Selector and on the site.

3. **`bookmarks` Table (The "Netflix Queue")**
    * **Purpose**: To store a list of resources that a specific person wants to save.
    * **Key Columns**:
        * `profile_id`: A **foreign key** linking directly to the `id` in the `member_profiles` table. This ensures the bookmark belongs to an individual, not the whole pharmacy.
        * `resource_id`: A **foreign key** linking to the specific file or resource that was bookmarked.

4. **`member_training_progress` Table (The "Netflix Queue")**
    * **Purpose**: To track the viewing history and completion status of training modules for each person.
    * **Key Columns**:
        * `profile_id`: A **foreign key** linking directly to the `id` in the `member_profiles` table. This ensures progress is tracked on a per-person basis.
        * `training_module_id`: A **foreign key** linking to the specific video being watched.
        * `last_position`, `is_completed`: Columns that store the individual's progress within that specific training module.

## **Part 3: Data Operations in Action**

Here is how these tables are queried during a typical user session:

* **On Login**:
    1. Authenticate using the `email` from the **`accounts`** table.
    2. Once successful, fetch the `account.id`.
    3. Immediately query the **`member_profiles`** table:
        * `SELECT id, first_name, last_name, profile_role FROM member_profiles WHERE member_account_id = '[authenticated_account_id]';`
    4. Use this list to populate the Profile Selector modal.

* **On Profile Selection**:
    1. The user selects a profile, and the application stores that `profile.id` in the active `profileState`.
    2. The application then fetches all personalized data for that profile.
        * `SELECT resource_id FROM bookmarks WHERE profile_id = '[active_profile_id]';`
        * `SELECT training_module_id, is_completed FROM member_training_progress WHERE profile_id = '[active_profile_id]';`
    3. This data is used to populate the UI, perhaps by showing a checkmark next to completed training modules.

* **When a User Bookmarks a Resource**:
  * The application performs a simple database insert:
    * `INSERT INTO bookmarks (profile_id, resource_id) VALUES ('[active_profile_id]', '[clicked_resource_id]');`

This architecture perfectly achieves your goal: account-level authentication provides the key to the front door, while profile-level personalization furnishes each room differently for every member of the household.

Here is the complete, structured breakdown of the website's architecture, combining the user-facing front-end design with the specific back-end data requests required to power each page and feature.

***

## **Unified Website Architecture: Front-End & Back-End Specification**

This document outlines the complete plan for serving content to the ClinicalRxQ member website. It details both the user experience on the front-end and the precise, efficient Supabase database calls required on the back-end.

## **Part 1: The User Experience (Front-End Design)**

The member portal is designed for two primary user behaviors: structured, program-based learning and rapid, specific resource retrieval.

### **Clinical Program Pages**

These pages are the core of the structured learning path. Each of the five clinical programs has a dedicated page that serves as a self-contained hub for all related materials. The interface is organized into clear, distinct tabs to prevent information overload.

* **Training Modules Tab**: Contains the core video-based training for the program. Each video is listed with its title and duration.
* **Manuals & Protocols Tab**: Houses the essential "how-to" guides and step-by-step Standard Operating Procedures (SOPs).
* **Documentation Forms Tab**: Provides all necessary downloadable and printable PDF forms, such as patient intake and consent forms.
* **Additional Resources Tab**: A repository for supplementary materials like links to external clinical guidelines or helpful articles.

**Special Case: Nested Accordions**
For programs with a high volume of forms like **MTM The Future Today** and **Test and Treat**, the "Documentation Forms" tab will feature a nested accordion layout to improve organization and reduce scrolling. Forms will be grouped first by `form_category` and then by `form_subcategory`, with all levels sorted alphabetically.

### **The Resource Library**

The Resource Library is the central, searchable repository for every single piece of content on the site. It is designed for members who know exactly what they are looking for and need to find it quickly. Its primary feature is a powerful, persistent filtering system.

* **Search Bar**: Allows users to find resources by searching for keywords in the file's name.
* **Filter by Clinical Program**: Enables users to isolate all content belonging to one or more specific programs.
* **Filter by Resource Type**: Allows users to find a specific *type* of document (e.g., "protocol_manual", "documentation_form") across all programs simultaneously.

---

## **Part 2: The Data Engine (Back-End Requests)**

To ensure fast and efficient data delivery, the website will query a series of purpose-built tables and views from the Supabase database. The following is a definitive guide to the requests for each page.

### **Page: Clinical Programs List**

* **Purpose**: To display all available programs for members to select.
* **Table to Call**: `programs`
* **Action**: Fetch all rows from the table, sorted alphabetically.
  * `SELECT name, description, experience_level FROM programs ORDER BY name ASC;`

### **Page: Individual Clinical Program (e.g., "HbA1C Testing")**

This page uses a combination of views to populate its tabs efficiently.

* **Tab: "Training Modules"**
  * **Purpose**: To display videos in the correct sequence with their duration.
  * **Table to Call**: `training_resources_view`
  * **Action**: Fetch all training modules for the specific program, sorted by the pre-defined `sort_order`.
    * `SELECT file_name, file_url, length FROM training_resources_view WHERE program_name = 'HbA1C Testing (A1C)' ORDER BY sort_order ASC;`

* **Tab: "Manuals & Protocols"**
  * **Purpose**: To display an alphabetized list of all manuals for this program.
  * **Table to Call**: The program-specific view (e.g., `hba1c_view`).
  * **Action**: Fetch all resources of the type 'protocol_manual'.
    * `SELECT file_name, file_url FROM hba1c_view WHERE resource_type = 'protocol_manual' ORDER BY file_name ASC;`

* **Tab: "Documentation Forms" (Standard Programs like HbA1C, TimeMyMeds, Oral Contraceptives)**
  * **Purpose**: To display an alphabetized list of all forms for this program.
  * **Table to Call**: The program-specific view (e.g., `hba1c_view`).
  * **Action**: Fetch all resources of the type 'documentation_form'.
    * `SELECT file_name, file_url FROM hba1c_view WHERE resource_type = 'documentation_form' ORDER BY file_name ASC;`

* **Tab: "Documentation Forms" (Special Cases: MTM The Future Today & Test and Treat)**
  * **Purpose**: To fetch all forms and their categories to build the nested accordion UI.
  * **Table to Call**: The program-specific view (e.g., `mtmthefuturetoday_view`).
  * **Action**: Fetch all forms without sorting, as it will be handled on the front-end.
    * `SELECT file_name, file_url, form_category, form_subcategory FROM mtmthefuturetoday_view WHERE resource_type = 'documentation_form';`
  * **Front-End Logic**: The application code will receive this data and perform the grouping and alphabetizing necessary to render the nested accordions.

* **Tab: "Additional Resources"**
  * **Purpose**: To display an alphabetized list of all additional resources.
  * **Table to Call**: The program-specific view (e.g., `hba1c_view`).
  * **Action**: Fetch all resources of the type 'additional_resource'.
    * `SELECT file_name, file_url FROM hba1c_view WHERE resource_type = 'additional_resource' ORDER BY file_name ASC;`

### **Page: Resource Library**

* **Purpose**: To provide a searchable and filterable view of every file on the site.
* **Table to Call for Initial Load**: `storage_files_catalog`
* **Action**: Fetch all rows. This provides the front-end with all the data it needs to perform client-side filtering without making additional database calls, resulting in a faster user experience.
  * `SELECT file_name, file_url, program_name, resource_type FROM storage_files_catalog;`
* **Filtering Logic**:
  * **Search Bar**: Filters the results locally where the `file_name` contains the search term.
  * **Filter by Program**: Filters the results locally where the `program_name` column matches the selected program(s).
  * **Filter by Resource Type**: Filters the results locally where the `resource_type` column matches the selected type(s).
