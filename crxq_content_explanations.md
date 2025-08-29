Of course. You are correct to demand a unified, comprehensive document. My apologies for the iterative approach.

Here is the complete, structured breakdown of the website's architecture, combining the user-facing front-end design with the specific back-end data requests required to power each page and feature.

***

## **Unified Website Architecture: Front-End & Back-End Specification**

This document outlines the complete plan for serving content to the ClinicalRxQ member website. It details both the user experience on the front-end and the precise, efficient Supabase database calls required on the back-end.

### **Part 1: The User Experience (Front-End Design)**

The member portal is designed for two primary user behaviors: structured, program-based learning and rapid, specific resource retrieval.

#### **Clinical Program Pages**

These pages are the core of the structured learning path. Each of the five clinical programs has a dedicated page that serves as a self-contained hub for all related materials. The interface is organized into clear, distinct tabs to prevent information overload.



* **Training Modules Tab**: Contains the core video-based training for the program. Each video is listed with its title and duration.
* **Manuals & Protocols Tab**: Houses the essential "how-to" guides and step-by-step Standard Operating Procedures (SOPs).
* **Documentation Forms Tab**: Provides all necessary downloadable and printable PDF forms, such as patient intake and consent forms.
* **Additional Resources Tab**: A repository for supplementary materials like links to external clinical guidelines or helpful articles.

**Special Case: Nested Accordions**
For programs with a high volume of forms like **MTM The Future Today** and **Test and Treat**, the "Documentation Forms" tab will feature a nested accordion layout to improve organization and reduce scrolling. Forms will be grouped first by `form_category` and then by `form_subcategory`, with all levels sorted alphabetically.

#### **The Resource Library**

The Resource Library is the central, searchable repository for every single piece of content on the site. It is designed for members who know exactly what they are looking for and need to find it quickly. Its primary feature is a powerful, persistent filtering system.



* **Search Bar**: Allows users to find resources by searching for keywords in the file's name.
* **Filter by Clinical Program**: Enables users to isolate all content belonging to one or more specific programs.
* **Filter by Resource Type**: Allows users to find a specific *type* of document (e.g., "protocol_manual", "documentation_form") across all programs simultaneously.

---

### **Part 2: The Data Engine (Back-End Requests)**

To ensure fast and efficient data delivery, the website will query a series of purpose-built tables and views from the Supabase database. The following is a definitive guide to the requests for each page.

#### **Page: Clinical Programs List**

* **Purpose**: To display all available programs for members to select.
* **Table to Call**: `programs`
* **Action**: Fetch all rows from the table, sorted alphabetically.
    * `SELECT name, description, experience_level FROM programs ORDER BY name ASC;`

#### **Page: Individual Clinical Program (e.g., "HbA1C Testing")**

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

#### **Page: Resource Library**

* **Purpose**: To provide a searchable and filterable view of every file on the site.
* **Table to Call for Initial Load**: `storage_files_catalog`
* **Action**: Fetch all rows. This provides the front-end with all the data it needs to perform client-side filtering without making additional database calls, resulting in a faster user experience.
    * `SELECT file_name, file_url, program_name, resource_type FROM storage_files_catalog;`
* **Filtering Logic**:
    * **Search Bar**: Filters the results locally where the `file_name` contains the search term.
    * **Filter by Program**: Filters the results locally where the `program_name` column matches the selected program(s).
    * **Filter by Resource Type**: Filters the results locally where the `resource_type` column matches the selected type(s).